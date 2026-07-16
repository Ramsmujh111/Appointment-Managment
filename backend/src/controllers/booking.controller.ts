import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import {
  getSlots,
  createBooking,
  getUserBookings,
  cancelBooking,
} from '../services/booking.service';

export async function listSlots(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const date = req.query.date as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string || '10', 10)));

    // userId is optional here — slots are public, but if a token is present
    // we use it to flag which slot the current user has already booked
    const result = await getSlots({ date, page, limit, userId: req.userId });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function bookSlot(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { slot_id } = req.body;

    if (!slot_id) {
      res.status(400).json({ success: false, error: 'slot_id is required' });
      return;
    }

    const booking = await createBooking(req.userId!, slot_id);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

export async function myBookings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const bookings = await getUserBookings(req.userId!);
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await cancelBooking(id, req.userId!);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
