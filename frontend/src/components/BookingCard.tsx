import React, { useState } from 'react';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';

interface Booking {
  id: string;
  status: 'active' | 'cancelled';
  booked_at: string;
  cancelled_at: string | null;
  slot: {
    date: string;
    start_time: string;
    end_time: string;
  };
}

interface Props {
  booking: Booking;
  onCancel: (id: string) => Promise<string | null>;
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export default function BookingCard({ booking, onCancel }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  async function handleConfirmCancel() {
    setCancelling(true);
    const error = await onCancel(booking.id);
    setCancelling(false);
    setModalOpen(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success('Appointment cancelled successfully.');
    }
  }

  const isActive = booking.status === 'active';
  const timeLabel = `${formatTime(booking.slot.start_time)} – ${formatTime(booking.slot.end_time)} on ${booking.slot.date}`;

  return (
    <>
      <div className={`card mb-2 border-${isActive ? 'primary' : 'secondary'}`}>
        <div className="card-body py-2">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="mb-0 fw-semibold">
                {booking.slot.date} &nbsp;·&nbsp;
                {formatTime(booking.slot.start_time)} – {formatTime(booking.slot.end_time)}
              </p>
              <p className="mb-0 small text-muted">
                Booked on {new Date(booking.booked_at).toLocaleDateString()}
                {booking.cancelled_at && (
                  <> · Cancelled on {new Date(booking.cancelled_at).toLocaleDateString()}</>
                )}
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className={`badge bg-${isActive ? 'primary' : 'secondary'}`}>
                {isActive ? 'Active' : 'Cancelled'}
              </span>
              {isActive && (
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setModalOpen(true)}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    'Cancel'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This cannot be undone."
        detail={timeLabel}
        confirmText="Yes, Cancel It"
        confirmVariant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
