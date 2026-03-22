import { NextRequest, NextResponse } from 'next/server';
import { runPlannerAgent } from '@/lib/agents/planner';
import { runInsightAgent } from '@/lib/agents/insight';
import { runExecutionAgent } from '@/lib/agents/execution';
import { validateProblemStatement } from '@/lib/validators';
import { AgentError } from '@/lib/gemini';
import { PlanRequest } from '@/types/api';
import { Report } from '@/types/report';
import { verifySessionToken, AuthError } from '@/lib/firebase/verifyToken';
import { saveReport, incrementPlanCount } from '@/lib/firebase/firestore';
import { checkRateLimit } from '@/lib/rateLimit';

export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: NextRequest) {
  let uid: string;
  try {
    const verified = await verifySessionToken();
    uid = verified.uid;
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: true, message: err.message }, { status: err.statusCode });
    }
    return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
  }

  const limited = await checkRateLimit(uid, 'orchestrate', 5, 60);
  if (limited) {
    return NextResponse.json(
      { error: true, message: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  try {
    const body = await req.json() as PlanRequest;
    
    const validation = validateProblemStatement(body.problemStatement);
    if (!validation.valid) {
      return NextResponse.json(
        { error: true, message: validation.error, suggestion: validation.suggestion },
        { status: 400 }
      );
    }

    const customStream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        try {
          sendEvent('step_start', { step: 1, name: 'Planner Agent' });
          const plannerStart = Date.now();
          const plannerOutput = await runPlannerAgent(body.problemStatement);
          sendEvent('step_complete', { step: 1, duration: Date.now() - plannerStart, output: plannerOutput });

          sendEvent('step_start', { step: 2, name: 'Insight Agent' });
          const insightStart = Date.now();
          const insightOutput = await runInsightAgent(body.problemStatement, plannerOutput);
          sendEvent('step_complete', { step: 2, duration: Date.now() - insightStart, output: insightOutput });

          sendEvent('step_start', { step: 3, name: 'Execution Agent' });
          const executionStart = Date.now();
          const executionOutput = await runExecutionAgent(body.problemStatement, plannerOutput, insightOutput);

          const report: Report = {
            id: crypto.randomUUID(),
            problemStatement: body.problemStatement,
            createdAt: new Date().toISOString(),
            sections: executionOutput.sections.map(s => ({
              ...s,
              rawText: JSON.stringify(s.content, null, 2),
              versions: []
            })),
            agentTrace: {
              plannerOutput,
              insightOutput
            }
          };

          // Save to Firestore
          await saveReport(uid, report);
          await incrementPlanCount(uid);

          sendEvent('step_complete', { step: 3, duration: Date.now() - executionStart });
          sendEvent('done', { report });
          controller.close();
        } catch (error) {
          console.error('Orchestration Stream Error:', error);
          if (error instanceof AgentError) {
            sendEvent('error', { agent: error.agent, message: error.message });
          } else {
            sendEvent('error', { agent: 'system', message: 'An unexpected orchestrator error occurred.' });
          }
          controller.close();
        }
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Orchestrator Request Error:', error);
    return NextResponse.json({ error: true, message: 'Internal Server Error' }, { status: 500 });
  }
}
