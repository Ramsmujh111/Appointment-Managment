import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSlots } from '../hooks/useSlots';
import SlotCard from '../components/SlotCard';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

export default function SlotsPage() {

  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const { slots, pagination, loading, error, refresh } = useSlots(dateFilter, page);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDateFilter(e.target.value);
    setPage(1);
  }

  function handleBooked() {
    refresh();
    toast.info('Slot booked! View it in My Bookings.');
  }

  function handleLoginRequired() {
    toast.warning('Please log in to book a slot');
    navigate('/login');
  }

  return (
    <div className="container py-4">
      <div className="page-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Available Slots</h5>
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0 small text-muted">Filter by date:</label>
          <input
            type="date"
            className="form-control form-control-sm"
            value={dateFilter}
            onChange={handleDateChange}
            style={{ width: 160 }}
          />
          {dateFilter && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => { setDateFilter(''); setPage(1); }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading && <Spinner />}

      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && slots.length === 0 && (
        <div className="alert alert-info">
          No slots found{dateFilter ? ` for ${dateFilter}` : ''}. Try a different date.
        </div>
      )}

      {!loading && slots.map((slot) => (
        <SlotCard
          key={slot.id}
          slot={slot}
          isLoggedIn={isLoggedIn}
          onBooked={handleBooked}
          onLoginRequired={handleLoginRequired}
        />
      ))}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <nav className="mt-3">
          <ul className="pagination pagination-sm justify-content-center mb-0">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
            </li>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(p)}>
                  {p}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === pagination.pages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

      {pagination && (
        <p className="text-center text-muted small mt-2">
          Showing {slots.length} of {pagination.total} slots
        </p>
      )}
    </div>
  );
}
