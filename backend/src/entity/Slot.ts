import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Booking } from './Booking';

@Entity('slots')
@Index(['date'])
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // stored as 'YYYY-MM-DD' string — keeps date math simple and timezone-safe
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Booking, (booking) => booking.slot)
  bookings: Booking[];
}
