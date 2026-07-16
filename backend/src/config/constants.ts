// Defaults to 60 minutes if not set in .env
export const CANCEL_CUTOFF_MINUTES = parseInt(
  process.env.CANCEL_CUTOFF_MINUTES || '60',
  10
);

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_dev_only';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
