'use client';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useReports } from '@/hooks/useReports';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { format } from 'date-fns';
import { FileText, PlusCircle, Trash2 } from 'lucide-react';
import { authenticatedFetch } from '@/lib/apiClient';

export default function DashboardPage() {
  const { reports, loading, error, refresh } = useReports();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const res = await authenticatedFetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        refresh();
      } else {
        alert('Failed to delete report.');
      }
    } catch(err) {
      console.error(err);
      alert('Error deleting report.');
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Your Reports</h1>
            <p className="mt-1 text-sm text-gray-500">Access and export your previously generated execution plans.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex justify-between items-center">
              {error}
              <button onClick={refresh} className="underline text-sm font-medium">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2 mb-8"></div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="h-8 bg-gray-100 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center bg-white border border-dashed border-gray-300 rounded-xl py-12 px-6">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No plans yet</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                Get started by creating your first AI-generated execution plan.
              </p>
              <div className="mt-6">
                <Link href="/plan/new" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 rounded-md font-medium text-sm transition-colors">
                  <PlusCircle className="w-4 h-4" />
                  Create Report
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reports.map(r => (
                <div key={r.id} className="bg-white rounded-lg shadow-sm border flex flex-col group hover:shadow-md transition-shadow">
                  <div className="p-6 flex-1 cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">
                         {r.problemStatement}
                       </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Created {format(new Date(r.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="border-t px-6 py-3 flex items-center justify-between bg-gray-50/50 rounded-b-lg">
                    <Link href={`/plan/${r.id}`} className="text-sm font-medium text-primary hover:text-indigo-800 transition-colors">
                      View Report →
                    </Link>
                    <button 
                      onClick={(e) => handleDelete(r.id, e)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
