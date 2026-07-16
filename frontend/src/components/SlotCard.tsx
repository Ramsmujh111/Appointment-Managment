import React, { useState } from 'react';
import { toast } from 'react-toastify';
import client from '../api/client';
import ConfirmModal from './ConfirmModal';

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  booked_by_me: boolean;
}

interface Props {
  slot: Slot;
  isLoggedIn: boolean;
  onBooked: () => void;
  onLoginRequired: () => void;
}

// Format "09:00:00" → "9:00 AM"
function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function SlotCard({ slot, isLoggedIn, onBooked, onLoginRequired }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [booking, setBooking] = useState(false);

  // clicking "Book" — if not logged in, redirect. otherwise open confirm modal
  function handleBookClick() {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    setModalOpen(true);
  }

  async function handleConfirm() {
    setBooking(true);
    try {
      await client.post('/bookings', { slot_id: slot.id });
      setModalOpen(false);
      toast.success('Appointment booked! Check My Bookings to see it.');
      onBooked();
    } catch (err: any) {
      setModalOpen(false);
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  }

  const timeLabel = `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)} on ${slot.date}`;

  return (
    <>
      <div className={`card slot-card mb-2 ${slot.is_available ? 'available' : 'booked'}`}>
        <div className="card-body py-2 d-flex justify-content-between align-items-center">
          <div>
            <span className="fw-semibold">
              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
            </span>
            <span className="text-muted ms-3 small">{slot.date}</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            {slot.is_available ? (
              <>
                <span className="badge bg-success">Available</span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleBookClick}
                  disabled={booking}
                >
                  <i className="bi bi-plus me-1" />
                  Book
                </button>
              </>
            ) : slot.booked_by_me ? (
              <span className="badge bg-primary">Your Booking</span>
            ) : (
              <span className="badge bg-danger">Booked</span>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title="Confirm Booking"
        message="Are you sure you want to book this appointment?"
        detail={timeLabel}
        confirmText="Yes, Book It"
        confirmVariant="primary"
        loading={booking}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
