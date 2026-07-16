import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Slot } from './Slot';

export type BookingStatus = 'active' | 'cancelled';

@Entity('bookings')
// only one active booking per slot
@Index(['slot_id'], { unique: true, where: '"status" = \'active\'' })
@Index(['user_id', 'status'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  // add the cascade the make data intregaty for if we deleted the one parent records 
  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })

  // for the Join Colums for the booking 
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => Slot, (slot) => slot.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'slot_id' })
  slot: Slot;
  // slot id to get the slot 
  @Column()
  slot_id: string;

  @Column({ type: 'varchar', default: 'active' })
  status: BookingStatus;

  @CreateDateColumn()
  booked_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  cancelled_at: Date | null;
}
