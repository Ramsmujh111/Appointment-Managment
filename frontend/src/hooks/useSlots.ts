import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  booked_by_me: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function useSlots(date: string, page: number) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = { page, limit: 10 };
      if (date) params.date = date;

      const res = await client.get('/slots', { params });
      setSlots(res.data.data);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [date, page]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Expose a refresh so parent can call it after a booking
  return { slots, pagination, loading, error, refresh: fetchSlots };
}
