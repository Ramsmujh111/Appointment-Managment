import { Request, Response, NextFunction } from 'express';

// Anything thrown in async controllers lands here.
// Keeps controllers clean — they just throw, we catch.
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error]', err.message || err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({
    success: false,
    error: message,
  });
}

// Thin helper so services can throw with an HTTP status code attached
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
