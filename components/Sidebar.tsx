import { useState } from 'react';
import { AgentStatus, ProgressState } from '@/app/plan/new/page';
import { Report } from '@/types/report';
import { FileDown, PlusCircle, CheckCircle2, ChevronRight, Download, X } from 'lucide-react';
import { authenticatedFetch } from '@/lib/apiClient';
import Link from 'next/link';

export function Sidebar({
  report,
  status,
  progress,
  onNewReport,
  onClose
}: {
  report: Report | null,
  status: AgentStatus,
  progress: ProgressState,
  onNewReport: () => void,
  onClose?: () => void
}) {
  const [exportingDoc, setExportingDoc] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const handleExport = async (type: 'docx' | 'pdf') => {
    if (!report) return;

    const setter = type === 'docx' ? setExportingDoc : setExportingPdf;
    setter(true);

    try {
      const res = await authenticatedFetch(`/api/export/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id })
      });

      if (!res.ok) throw new Error(`Failed to generate ${type.toUpperCase()}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const rawTitle = report.problemStatement || 'planning-report';
      const safeTitle = rawTitle.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').substring(0, 50).toLowerCase();
      a.download = `${safeTitle}.${type}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setter(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between px-2">
        <Link href="/dashboard">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold">
              A
            </div>
            <span className="font-semibold text-gray-900 tracking-tight">AI Planning Agent</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-md text-gray-500 hover:bg-gray-200 transition-colors lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <button
        onClick={onNewReport}
        className="flex items-center gap-2 bg-white border shadow-sm hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-md transition-colors font-medium text-sm group"
      >
        <PlusCircle className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
        New Report
      </button>

      {report && (
        <div className="flex flex-col gap-1 mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Export</h3>
          <button
            onClick={() => handleExport('docx')}
            disabled={exportingDoc}
            className="flex items-center justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-2 text-sm transition-colors text-left disabled:opacity-50"
          >
            <span className="flex items-center gap-2"><FileDown className="w-4 h-4" /> Word (.docx)</span>
            {exportingDoc && <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>}
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exportingPdf}
            className="flex items-center justify-between text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-2 text-sm transition-colors text-left disabled:opacity-50"
          >
            <span className="flex items-center gap-2"><Download className="w-4 h-4" /> Acrobat (.pdf)</span>
            {exportingPdf && <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>}
          </button>
        </div>
      )}

      {report && (
        <div className="flex flex-col gap-1 mt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Sections</h3>
          {report.sections.map(s => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-primary hover:bg-indigo-50/50 rounded-md px-3 py-2 text-sm transition-colors"
            >
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="truncate">{s.title}</span>
            </a>
          ))}
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1"></div>

      {report && (
        <div className="pb-4 px-2 text-xs text-gray-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3 text-green-500" />
          Saved to cloud
        </div>
      )}
    </div>
  );
}
