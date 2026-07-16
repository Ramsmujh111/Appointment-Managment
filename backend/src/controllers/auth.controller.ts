import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

// simple regex — catches the most obvious cases (no @, no dot after @, etc.)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'name, email, and password are required' });
      return;
    }

    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: 'Please provide a valid email address' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'password must be at least 6 characters' });
      return;
    }

    const result = await registerUser(name, email, password);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: 'Please provide a valid email address' });
      return;
    }

    const result = await loginUser(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
