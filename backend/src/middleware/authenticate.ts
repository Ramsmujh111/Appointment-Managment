import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/constants';

// Extend express Request so downstream handlers can read req.userId
export interface AuthRequest extends Request {
  userId?: string;
}

// Hard guard — rejects the request if no valid token is present
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Token is invalid or expired' });
  }
}

// Soft guard — attaches userId if a valid token is found, never blocks the request.
// Useful on public routes that can return extra info when a user is logged in.
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (header && header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as { userId: string };
      req.userId = payload.userId;
    } catch {
      // expired or invalid token — treat as unauthenticated, keep going
    }
  }

  next();
}
