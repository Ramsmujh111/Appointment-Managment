import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
// import { Slot } from '../entity/dt/Slot';
// import { Booking } from '../entity/dt/Booking';
import { Slot } from '../entity/Slot';
import { Booking } from '../entity/Booking';
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'appointment_db',
  synchronize: true,
  logging: false,
  entities: [User, Slot, Booking],
});
