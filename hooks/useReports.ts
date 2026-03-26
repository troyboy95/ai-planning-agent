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
    setError(null);
    authenticatedFetch('/api/reports')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Network response was not ok');
        }
        return res.json();
      })
      .then(data => setReports(data.reports ?? []))
      .catch((err) => {
        console.error('Fetch reports error:', err);
        setError('Failed to load your reports.');
      })
      .finally(() => setLoading(false));
  }, [user, idToken]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, error, refresh: fetchReports };
}
