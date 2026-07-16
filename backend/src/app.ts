import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Helmet sets security-related HTTP headers (XSS protection, no sniff, etc.)
app.use(helmet());

// Morgan logs every incoming request — 'dev' gives colored short output in terminal
app.use(morgan('dev'));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);

// Health check — useful for Docker/deployment
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Must be registered last — catches anything thrown upstream
app.use(errorHandler);

AppDataSource.initialize()
  .then(() => {
    console.log('Connected to PostgreSQL');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });

export default app;
