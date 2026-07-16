import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

interface Booking {
  id: string;
  status: 'active' | 'cancelled';
  booked_at: string;
  cancelled_at: string | null;
  slot: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
  };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.get('/bookings/mine');
      setBookings(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Optimistic cancel — remove booking from list immediately, restore if API fails
  const cancelBooking = async (id: string): Promise<string | null> => {
    const previous = bookings;
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );

    try {
      await client.delete(`/bookings/${id}`);
      return null; // no error
    } catch (err: any) {
      setBookings(previous); // rollback
      return err.response?.data?.error || 'Cancellation failed';
    }
  };

  return { bookings, loading, error, refresh: fetchBookings, cancelBooking };
}
