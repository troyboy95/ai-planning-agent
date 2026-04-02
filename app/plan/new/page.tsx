"use client";

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { InputState } from '@/components/InputState';
import { ReportView } from '@/components/ReportView';
import { Report } from '@/types/report';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { authenticatedFetch } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export type AgentStatus = 'idle' | 'generating' | 'done' | 'error';
export type StepStatus = 'pending' | 'active' | 'done';

export interface ProgressState {
  moderator: StepStatus;
  planner: StepStatus;
  insight: StepStatus;
  execution: StepStatus;
  elapsedMs: {
    moderator?: number;
    planner?: number;
    insight?: number;
    execution?: number;
  };
  error?: string;
}

export default function NewPlanPage() {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [progress, setProgress] = useState<ProgressState>({
    moderator: 'pending',
    planner: 'pending',
    insight: 'pending',
    execution: 'pending',
    elapsedMs: {}
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGenerate = async (problemStatement: string) => {
    setStatus('generating');
    setProgress({ moderator: 'pending', planner: 'pending', insight: 'pending', execution: 'pending', elapsedMs: {} });
    setReport(null);

    try {
      const response = await authenticatedFetch('/api/agent/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemStatement })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || err.message || 'Failed to start generation');
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamDone = false;
      // Buffer accumulates partial SSE data across read() boundaries.
      // In production (Vercel edge / CDN), TCP packets don't align with
      // SSE \n\n event boundaries, so we MUST buffer and only process
      // complete events to avoid crashing on partial data.
      let buffer = '';

      const processEvent = (ev: string) => {
        const lines = ev.split('\n');
        let eventType = '';
        let eventData: any = undefined;

        for (const l of lines) {
          if (l.startsWith('event: ')) {
            eventType = l.slice('event: '.length).trim();
          } else if (l.startsWith('data: ')) {
            const dataStr = l.slice('data: '.length);
            try {
              eventData = JSON.parse(dataStr);
            } catch {
              eventData = dataStr;
            }
          }
        }

        if (!eventType || eventData === undefined) return false; // incomplete, skip

        if (eventType === 'step_start') {
          const data = eventData;
          setProgress(prev => ({
            ...prev,
            [data.step === 0 ? 'moderator' : data.step === 1 ? 'planner' : data.step === 2 ? 'insight' : 'execution']: 'active'
          }));
        } else if (eventType === 'step_complete') {
          const data = eventData;
          setProgress(prev => {
            const nextp = { ...prev };
            const key = data.step === 0 ? 'moderator' : data.step === 1 ? 'planner' : data.step === 2 ? 'insight' : 'execution';
            nextp[key] = 'done';
            nextp.elapsedMs = { ...nextp.elapsedMs, [key]: data.duration };
            return nextp;
          });
        } else if (eventType === 'done') {
          const reportId = eventData?.report?.id;
          if (!reportId) {
            // Guard: AI returned a done event but report.id is missing
            console.error('[SSE] done event missing report.id:', eventData);
            setStatus('error');
            setProgress(prev => ({ ...prev, error: 'Report was generated but could not be saved. Please try again.' }));
            return true; // signal stop
          }
          setStatus('done');
          router.push(`/plan/${reportId}`);
          return true; // signal stop
        } else if (eventType === 'error') {
          setStatus('error');
          setProgress(prev => ({ ...prev, error: eventData?.message || 'Agent error' }));
          return true; // signal stop
        }

        return false;
      };

      while (!streamDone) {
        const { value, done: readerDone } = await reader.read();
        streamDone = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }

        // Process all complete SSE events in the buffer
        let boundary: number;
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          if (!rawEvent.trim()) continue;

          const shouldStop = processEvent(rawEvent);
          if (shouldStop) {
            streamDone = true;
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setProgress(prev => ({ ...prev, error: (error as Error).message }));
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-gray-900/80 transition-opacity" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex w-[280px] max-w-sm flex-col overflow-y-auto bg-[#F9FAFB] p-4 shadow-xl">
              <Sidebar
                report={report}
                status={status}
                progress={progress}
                onNewReport={() => {
                  setReport(null);
                  setStatus('idle');
                  setProgress({ moderator: 'pending', planner: 'pending', insight: 'pending', execution: 'pending', elapsedMs: {} });
                  setMobileMenuOpen(false);
                }}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-[280px] border-r bg-[#F9FAFB] p-4 shrink-0 overflow-y-auto">
          <Sidebar
            report={report}
            status={status}
            progress={progress}
            onNewReport={() => {
              setReport(null);
              setStatus('idle');
              setProgress({ moderator: 'pending', planner: 'pending', insight: 'pending', execution: 'pending', elapsedMs: {} });
            }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth bg-white">
          <Header showMenuButton onMenuClick={() => setMobileMenuOpen(true)} />
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {status === 'idle' && (
              <div className="h-full flex flex-col justify-center animate-fade-in pb-20">
                <InputState onSubmit={handleGenerate} />
              </div>
            )}

            {(status === 'generating' || status === 'error') && !report && (
              <div className="h-full flex flex-col items-center justify-center animate-fade-in pb-20 max-w-xl mx-auto w-full">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Problem Space</h2>
                  <p className="text-gray-500">Our agents are decomposing your request and building a tailored execution plan.</p>
                </div>
                <div className="w-full bg-white border rounded-xl shadow-sm p-6 space-y-4">
                  <Step
                    title="Step 0: Safety Check — Analyzing request intent"
                    status={progress.moderator}
                    ms={progress.elapsedMs.moderator}
                  />
                  <Step
                    title="Step 1: Planner Agent — Decomposing your problem"
                    status={progress.planner}
                    ms={progress.elapsedMs.planner}
                  />
                  <Step
                    title="Step 2: Insight Agent — Enriching with context"
                    status={progress.insight}
                    ms={progress.elapsedMs.insight}
                  />
                  <Step
                    title="Step 3: Execution Agent — Generating report"
                    status={progress.execution}
                    ms={progress.elapsedMs.execution}
                  />
                </div>
                {progress.error && (
                  <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg w-full text-sm border border-red-100 flex items-start gap-3">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <div className="font-semibold mb-1">Generation failed</div>
                      <div>{progress.error}</div>
                      <button
                        onClick={() => setStatus('idle')}
                        className="mt-3 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

function Step({ title, status, ms }: { title: string, status: StepStatus, ms?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 w-6 h-6 flex items-center justify-center">
        {status === 'done' ? (
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
          </div>
        ) : status === 'active' ? (
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <div className="w-5 h-5 border-2 border-gray-200 rounded-full"></div>
        )}
      </div>
      <div className="flex-1 flex justify-between items-center text-sm">
        <span className={`font-medium ${status === 'active' ? 'text-gray-900' : status === 'done' ? 'text-gray-700' : 'text-gray-400'}`}>
          {title}
        </span>
        {ms !== undefined && <span className="text-xs text-gray-400">{ms}ms</span>}
      </div>
    </div>
  )
}
