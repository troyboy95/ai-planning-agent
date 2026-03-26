'use client';
import { useState, useEffect, use } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="fixed inset-0 bg-gray-900/80 transition-opacity" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex w-[280px] max-w-sm flex-col overflow-y-auto bg-[#F9FAFB] p-4 shadow-xl">
              <Sidebar
                report={report}
                status="done"
                progress={{ moderator: 'done', planner: 'done', insight: 'done', execution: 'done', elapsedMs: {} }}
                onNewReport={() => router.push('/plan/new')}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col w-[280px] border-r bg-[#F9FAFB] p-4 shrink-0 overflow-y-auto">
          <Sidebar
            report={report}
            status="done"
            progress={{ moderator: 'done', planner: 'done', insight: 'done', execution: 'done', elapsedMs: {} }}
            onNewReport={() => router.push('/plan/new')}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto relative scroll-smooth bg-white">
          <Header showMenuButton showTitle={false} onMenuClick={() => setMobileMenuOpen(true)} />
          <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            <div className="animate-fade-in space-y-6 pb-32">
              <ReportView report={report} onUpdate={handleUpdateReport} />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
