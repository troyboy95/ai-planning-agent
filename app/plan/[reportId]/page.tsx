'use client';
import { useState, useEffect, use } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ReportView } from '@/components/ReportView';
import { Report } from '@/types/report';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { authenticatedFetch } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

export default function PlanViewPage({ params }: { params: Promise<{ reportId: string }> }) {
  const resolvedParams = use(params);
  const reportId = resolvedParams.reportId;
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    authenticatedFetch(`/api/reports/${reportId}`)
      .then(res => {
         if (!res.ok) throw new Error('Not found');
         return res.json();
      })
      .then(data => setReport(data.report))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false));
  }, [reportId, router]);

  const handleUpdateReport = async (updated: Report) => {
    setReport(updated);
  };

  if (loading) return (
    <AuthGuard>
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    </AuthGuard>
  );

  if (!report) return null;

  return (
    <AuthGuard>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <div className="hidden md:flex flex-col w-[300px] border-r bg-[#F9FAFB] p-4 shrink-0">
          <Sidebar 
            report={report} 
            status="done" 
            progress={{planner:'done', insight:'done', execution:'done', elapsedMs:{}}} 
            onNewReport={() => router.push('/plan/new')} 
          />
        </div>
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth">
          <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky z-10 top-0">
            <div className="font-bold text-lg text-primary">AI Agent</div>
            <button onClick={() => router.push('/plan/new')} className="text-sm bg-gray-100 px-3 py-1 rounded">New</button>
          </div>
          <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
            <div className="animate-fade-in space-y-8 pb-32">
              <ReportView report={report} onUpdate={handleUpdateReport} />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
