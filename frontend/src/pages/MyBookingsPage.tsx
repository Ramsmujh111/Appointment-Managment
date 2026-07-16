import React from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import BookingCard from '../components/BookingCard';
import Spinner from '../components/Spinner';

export default function MyBookingsPage() {
  const { bookings, loading, error, cancelBooking } = useBookings();

  const active = bookings.filter((b) => b.status === 'active');
  const cancelled = bookings.filter((b) => b.status === 'cancelled');

  return (
    <div className="container py-4">
      <div className="page-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">My Bookings</h5>
        <Link to="/slots" className="btn btn-primary btn-sm">
          <i className="bi bi-plus me-1" />
          Book New Slot
        </Link>
      </div>

      {loading && <Spinner />}

      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">You haven't booked any appointments yet.</p>
          <Link to="/slots" className="btn btn-primary">Browse Available Slots</Link>
        </div>
      )}

      {!loading && active.length > 0 && (
        <section className="mb-4">
          <h6 className="text-muted mb-2">Active ({active.length})</h6>
          {active.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={cancelBooking}
            />
          ))}
        </section>
      )}

      {!loading && cancelled.length > 0 && (
        <section>
          <h6 className="text-muted mb-2">Cancelled ({cancelled.length})</h6>
          {cancelled.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onCancel={cancelBooking}
            />
          ))}
        </section>
      )}
    </div>
  );
}
