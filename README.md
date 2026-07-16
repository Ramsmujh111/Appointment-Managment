# Appointment Booking System

A full-stack appointment booking app built with Node.js, Express, PostgreSQL, TypeORM on the backend and React with Bootstrap 5 on the frontend.

---

## Tech Stack

- **Backend** — Node.js, Express, TypeScript, TypeORM
- **Database** — PostgreSQL
- **Frontend** — React 18, Vite, Bootstrap 5, Axios
- **Auth** — JWT (jsonwebtoken + bcryptjs)
- **Logging** — Morgan
- **Security** — Helmet

---

## Project Structure

```
AppointmentBookingSystem/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .env
│   └── src/
│       ├── config/        # database.ts, constants.ts
│       ├── entity/        # User, Slot, Booking (TypeORM entities)
│       ├── middleware/    # authenticate.ts, errorHandler.ts
│       ├── routes/        # auth.routes.ts, booking.routes.ts
│       ├── controllers/   # auth.controller.ts, booking.controller.ts
│       ├── services/      # auth.service.ts, booking.service.ts
│       ├── db/            # seed.ts
│       └── app.ts
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/           # Axios client
        ├── context/       # AuthContext, ToastContext
        ├── hooks/         # useSlots, useBookings
        ├── components/    # Navbar, SlotCard, BookingCard, ConfirmModal, Spinner
        ├── pages/         # LoginPage, RegisterPage, SlotsPage, MyBookingsPage
        └── App.tsx
```

---

## Running Locally (without Docker)

### Requirements
- Node.js 18+
- PostgreSQL running locally

### 1. Create the database

Open psql or pgAdmin and run:
```sql
CREATE DATABASE appointment_db;
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (copy from `.env.example`):
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=appointment_db
JWT_SECRET=pick_a_long_random_string
JWT_EXPIRES_IN=7d
CANCEL_CUTOFF_MINUTES=60
```

Start the backend:
```bash
npm run dev
```

TypeORM will auto-create all tables on first run.

Seed appointment slots for the next 14 days:
```bash
npm run seed
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Running with Docker

### Install Docker

Download and install Docker Desktop from https://www.docker.com/products/docker-desktop

Make sure Docker Desktop is **open and running** before using any docker commands. You can confirm it's running by checking for the Docker whale icon in your system tray.

### Start everything

From the project root folder:
```bash
docker-compose up --build
```

This will:
- Start a PostgreSQL container
- Build and start the backend (waits for Postgres to be healthy first)
- Build and start the frontend (served via nginx)

Once it's up, open **http://localhost** in your browser.

### Seed the slots (first time only)

```bash
docker exec appointment_backend node dist/db/seed.js
```

### Stop everything

```bash
docker-compose down
```

To also remove the database volume (deletes all data):
```bash
docker-compose down -v
```

---

## API Reference

Base URL: `http://localhost:3000/api`

All responses follow this shape:
```json
{ "success": true, "data": {} }
{ "success": false, "error": "message" }
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create a new account |
| POST | `/auth/login` | No | Login and get a JWT token |

**POST `/auth/register`** — body:
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**POST `/auth/login`** — body:
```json
{ "email": "john@example.com", "password": "secret123" }
```

Both return:
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com" }
  }
}
```

---

### Slots

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/slots` | Optional | List available slots (paginated) |

Query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `date` | YYYY-MM-DD | — | Filter by a specific date |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Results per page (max 50) |

Example: `GET /api/slots?date=2026-07-20&page=1&limit=10`

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2026-07-20",
      "start_time": "09:00:00",
      "end_time": "10:00:00",
      "is_available": true,
      "booked_by_me": false
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 80, "pages": 8 }
}
```

---

### Bookings

All booking routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/bookings` | Yes | Book a slot |
| GET | `/bookings/mine` | Yes | Get your bookings |
| DELETE | `/bookings/:id` | Yes | Cancel a booking |

**POST `/bookings`** — body:
```json
{ "slot_id": "uuid-of-the-slot" }
```

**DELETE `/bookings/:id`** — cancels a booking (must be at least 60 minutes before start time)

---

### Health Check

```
GET /health
```
Returns `{ "status": "ok", "timestamp": "..." }` — useful for Docker health checks.

---

## Business Rules

- A user can only book **one appointment per calendar day**
- **Overlapping** time slots cannot be booked
- Cannot book a slot that has **already passed**
- Cancellations must be made at least **60 minutes before** the appointment (configurable via `CANCEL_CUTOFF_MINUTES`)
- Concurrent booking of the same slot is prevented using **PostgreSQL row-level locking** inside a transaction

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3000` |
| `DB_HOST` | Postgres host | `localhost` |
| `DB_PORT` | Postgres port | `5432` |
| `DB_USER` | Postgres user | `postgres` |
| `DB_PASSWORD` | Postgres password | — |
| `DB_NAME` | Database name | `appointment_db` |
| `JWT_SECRET` | Secret key for signing tokens | — |
| `CANCEL_CUTOFF_MINUTES` | Minutes before appointment that cancellation is blocked | `60` |
