import { AppDataSource } from '../config/database';
import { Slot } from '../entity/Slot';
import { Booking } from '../entity/Booking';
import { AppError } from '../middleware/errorHandler';
import { CANCEL_CUTOFF_MINUTES } from '../config/constants';

function slotRepo() {
  return AppDataSource.getRepository(Slot);
}

function bookingRepo() {
  return AppDataSource.getRepository(Booking);
}

// ─── Slots ────────────────────────────────────────────────────────────────────

export async function getSlots(filters: { date?: string; page: number; limit: number; userId?: string }) {
  const { date, page, limit, userId } = filters;

  const qb = slotRepo()
    .createQueryBuilder('slot')
    .leftJoinAndSelect(
      'slot.bookings',
      'booking',
      'booking.status = :status',
      { status: 'active' }
    )
    .orderBy('slot.date', 'ASC')
    .addOrderBy('slot.start_time', 'ASC');

  if (date) {
    qb.where('slot.date = :date', { date });
  }

  const total = await qb.getCount();

  const slots = await qb
    .skip((page - 1) * limit)
    .take(limit)
    .getMany();

  // attach `is_available` flag so frontend doesn't have to compute it.
  // also attach `booked_by_me` when a userId is provided — lets logged-in users
  // see which slot is their own booking vs someone else's.
  const data = slots.map((slot) => {
    const activeBooking = slot.bookings[0] ?? null;
    return {
      id: slot.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: activeBooking === null,
      booked_by_me: userId ? activeBooking?.user_id === userId : false,
    };
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export async function createBooking(userId: string, slotId: string) {
  // Wrap in a transaction
  // pass the availability check and book the same slot.
  return AppDataSource.transaction(async (manager) => {
    // Lock the slot row so no other transaction can read/write it simultaneously
    const slot = await manager
      .getRepository(Slot)
      .createQueryBuilder('slot')
      .setLock('pessimistic_write')
      .where('slot.id = :id', { id: slotId })
      .getOne();

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    // Make sure the slot hasn't already passed
    const slotStart = new Date(`${slot.date}T${slot.start_time}`);

    if (slotStart <= new Date()) {
      throw new AppError('Cannot book a slot that has already passed', 400);
    }

    // is this slot already taken?
    const existingSlotBooking = await manager.getRepository(Booking).findOne({
      where: { slot_id: slotId, status: 'active' },
    });

    // the slot is already booked by someone or not
    if (existingSlotBooking) {
      throw new AppError('This slot is already booked', 409);
    }

    // Check: has this user already booked something on the same calendar day?
    const sameDayBooking = await manager
      .getRepository(Booking)
      .createQueryBuilder('booking')
      .innerJoin('booking.slot', 'slot')
      .where('booking.user_id = :userId', { userId }) // get the booking for this user and by user id
      .andWhere('booking.status = :status', { status: 'active' })
      .andWhere('slot.date = :date', { date: slot.date })
      .getOne();

    if (sameDayBooking) {
      throw new AppError('You already have a booking on this day', 400);
    }

    // new booking overlap with any of the user's existing ones 
    const overlapping = await manager
      .getRepository(Booking)
      .createQueryBuilder('booking')
      .innerJoin('booking.slot', 'slot')
      .where('booking.user_id = :userId', { userId })
      .andWhere('booking.status = :status', { status: 'active' })
      .andWhere('slot.date = :date', { date: slot.date })
      .andWhere('slot.start_time < :end_time AND slot.end_time > :start_time', {
        start_time: slot.start_time,
        end_time: slot.end_time,
      })
      .getOne();

    if (overlapping) {
      throw new AppError('This slot overlaps with one of your existing bookings', 400);
    }

    const booking = manager.getRepository(Booking).create({
      user_id: userId,
      slot_id: slotId,
      status: 'active',
    });

    await manager.getRepository(Booking).save(booking);

    return {
      id: booking.id,
      slot: {
        id: slot.id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time,
      },
      status: booking.status,
      booked_at: booking.booked_at,
    };
  });
}

export async function getUserBookings(userId: string) {

  const bookings = await bookingRepo()
    .createQueryBuilder('booking')
    .innerJoinAndSelect('booking.slot', 'slot') // get the booking for this user and by user id
    .where('booking.user_id = :userId', { userId })
    .orderBy('slot.date', 'DESC')
    .addOrderBy('slot.start_time', 'DESC')
    .getMany();

  return bookings.map((b) => ({
    id: b.id,
    status: b.status,
    booked_at: b.booked_at,
    cancelled_at: b.cancelled_at,
    slot: {
      id: b.slot.id,
      date: b.slot.date,
      start_time: b.slot.start_time,
      end_time: b.slot.end_time,
    },
  }));
}

export async function cancelBooking(bookingId: string, userId: string) {

  const booking = await bookingRepo().findOne({
    where: { id: bookingId },
    relations: ['slot'],
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  // Users can only cancel their own bookings
  if (booking.user_id !== userId) {
    throw new AppError('You are not allowed to cancel this booking', 403);
  }

  if (booking.status === 'cancelled') {
    throw new AppError('This booking is already cancelled', 400);
  }

  // cancellation window
  const slotStart = new Date(`${booking.slot.date}T${booking.slot.start_time}`);
  const cutoff = new Date(slotStart.getTime() - CANCEL_CUTOFF_MINUTES * 60 * 1000);

  if (new Date() > cutoff) {
    throw new AppError(
      `Cancellations must be made at least ${CANCEL_CUTOFF_MINUTES} minutes before the appointment`,
      400
    );
  }

  booking.status = 'cancelled';
  booking.cancelled_at = new Date();
  await bookingRepo().save(booking);

  return { id: booking.id, status: booking.status, cancelled_at: booking.cancelled_at };
}
