import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/lib/apiClient';
import { Report } from '@/types/report';

export function useReports() {
  const { user, idToken } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchReports = useCallback(() => {
    if (!user || !idToken) return;

    setLoading(true);
    authenticatedFetch('/api/reports')
      .then(res => res.json())
      .then(data => setReports(data.reports ?? []))
      .catch(() => setError('Failed to load your reports.'))
      .finally(() => setLoading(false));
  }, [user, idToken]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, error, refresh: fetchReports };
}
