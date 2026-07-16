import React from 'react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  detail?: string; // e.g. "9:00 AM – 10:00 AM on 2026-07-20"
  confirmText?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

// Reusable Bootstrap confirmation modal.
// Renders nothing when isOpen is false so it doesn't sit in the DOM invisibly.
export default function ConfirmModal({
  isOpen,
  title,
  message,
  detail,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop show" style={{ zIndex: 1040 }} onClick={onClose} />

      {/* Modal */}
      <div
        className="modal show d-block"
        tabIndex={-1}
        style={{ zIndex: 1050 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="confirm-modal-title">
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              <p className="mb-1">{message}</p>
              {detail && (
                <p className="mb-0 text-muted small fw-semibold">{detail}</p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                No, go back
              </button>
              <button
                type="button"
                className={`btn btn-${confirmVariant}`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Please wait...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
