import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entity/User';
import { AppError } from '../middleware/errorHandler';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/constants';

const userRepo = () => AppDataSource.getRepository(User);

export async function registerUser(name: string, email: string, password: string) {

  const existing = await userRepo().findOneBy({ email });

  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = userRepo().create({ name, email, password_hash });
  await userRepo().save(user);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

export async function loginUser(email: string, password: string) {

  const user = await userRepo().findOneBy({ email });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const match = await bcrypt.compare(password, user.password_hash);

  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: 60 * 60 * 24 * 7 });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
}
