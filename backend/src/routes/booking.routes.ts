import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/authenticate';
import { listSlots, bookSlot, myBookings, cancel } from '../controllers/booking.controller';

const router = Router();

// this router is use for the authentication of the user

router.get('/slots', optionalAuth, listSlots);

// Everything below requires a valid JWT
router.post('/bookings', authenticate, bookSlot);
router.get('/bookings/mine', authenticate, myBookings);
router.delete('/bookings/:id', authenticate, cancel);

export default router;
