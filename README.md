# NoGas.Init

**Real-time vehicle maintenance tracking and OBD-II diagnostics platform**

NoGas.Init is a full-stack application that monitors your vehicle's health in real-time by collecting diagnostic data via OBD-II hardware and providing a comprehensive dashboard for tracking maintenance schedules, service history, and fuel economy.

## Features

- 🚗 **Real-time OBD-II Data Collection** – Multi-tier sampling of diagnostic parameters (RPM, speed, engine load, fuel level, codes)
- 📊 **Maintenance Tracking** – Log service records, track maintenance schedules, and access service history
- ⛽ **Fuel Economy Monitoring** – MPG calculations and fuel consumption tracking
- 🔧 **Diagnostic Code Management** – Capture and track trouble codes (DTCs)
- 📱 **Vehicle Management** – Manage multiple vehicles with automatic VIN decoding
- 🔐 **Secure Authentication** – Email-based authentication with OTP verification
- 📈 **Trip Analytics** – Session tracking with trip duration, distance, and diagnostics

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16.2, React 19, TypeScript, TailwindCSS 4.2, shadcn/ui |
| **Backend** | Python 3.x, SQLAlchemy 2.0, python-obd 0.7.3 |
| **Database** | SQLite (local), LibSQL via Drizzle ORM (frontend), Supabase (cloud sync) |
| **Authentication** | Supabase Auth (email/password, OTP verification) |
| **Forms & Validation** | React Hook Form + Zod |
| **External APIs** | NHTSA VIN Decoder, Supabase Backend |
| **Styling** | Tailwind CSS, Radix UI, Lucide icons |

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Python** 3.8+
- **OBD-II Bluetooth/USB adapter** (optional, for real hardware testing)
- **Supabase account** (for authentication and cloud database)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd NoGas.Init
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Install backend dependencies:**
   ```bash
   cd obd
   pip install -r requirements.txt
   cd ..
   ```

### Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
DB_FILE_NAME=file:local.db
```

### Running Locally

**Frontend (Next.js dev server):**
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Backend (OBD data collection):**
```bash
cd obd
python main.py
```

### Available Scripts

**Frontend:**
- `npm run dev` – Start development server with Turbopack
- `npm run build` – Build for production
- `npm start` – Start production server
- `npm run lint` – Run ESLint
- `npm run format` – Format code with Prettier
- `npm run typecheck` – Run TypeScript type checker

**Backend:**
- `python main.py` – Start OBD data collection service
- `python test_main.py` – Run backend tests

## Project Structure

```
NoGas.Init/
├── frontend/                    # Next.js application
│   ├── app/                     # Next.js App Router
│   │   ├── auth/               # Authentication pages (login, signup, confirm)
│   │   ├── cars/               # Vehicle management
│   │   ├── dashboard/          # Main vehicle dashboard
│   │   ├── protected/          # Protected routes
│   │   └── layout.tsx          # Root layout with provider setup
│   ├── components/             # React components
│   │   ├── forms/              # Form components with Zod validation
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── ui/                 # Reusable UI components (shadcn/ui)
│   │   ├── login-form.tsx
│   │   ├── sign-up-form.tsx
│   │   └── app-sidebar.tsx
│   ├── lib/
│   │   ├── db/                 # Database schemas (Drizzle ORM)
│   │   │   └── schema.ts       # Database schema definitions
│   │   ├── supabase/           # Supabase authentication setup
│   │   │   ├── client.ts       # Client-side Supabase instance
│   │   │   ├── server.ts       # Server-side Supabase instance
│   │   │   └── middleware.ts   # Auth middleware for protected routes
│   │   └── utils.ts            # Utility functions
│   ├── hooks/                  # Custom React hooks
│   │   └── useRequireAuth.ts   # Auth guard hook
│   ├── package.json            # Frontend dependencies
│   └── tsconfig.json           # TypeScript configuration
│
├── obd/                        # Python backend
│   ├── main.py                 # Entry point - OBD data collection loop
│   ├── obd_handler.py          # OBD-II hardware communication
│   ├── db_handler.py           # Local database & Supabase sync
│   ├── models.py               # Pydantic models for validation
│   ├── requirements.txt        # Python dependencies
│   ├── test_main.py            # Unit tests
│   └── test_scripts/           # Individual test scripts
│       ├── mpg_test.py
│       ├── obd_test.py
│       └── ...
│
└── README.md                   # This file
```

## Architecture & Data Flow

### Overview

```
┌─────────────────────┐
│  OBD-II Hardware    │  (Bluetooth/USB adapter on COM6)
│  (Vehicle ECU)      │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Backend (Python)                    │
├──────────────────────────────────────┤
│ • OBDHandler                         │  Collects data in 3 tiers:
│   - VIN retrieval via OBD command    │  → Tier 1 (0.5s): RPM, speed, load
│   - Parameter queries (python-obd)   │  → Tier 2 (5s): temps, voltage
│   - NHTSA VIN decoder API            │  → Tier 3 (30s): fuel level
│ • DatabaseHandler                    │
│   - Logs to local SQLite             │  Syncs every 30s:
│   - Batches 50 records per sync      │  → Supabase `readings` table
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Database                            │
├──────────────────────────────────────┤
│ Local: SQLite (raw_readings)         │
│ Cloud: Supabase (synced data)        │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│  Frontend (Next.js + React)          │
├──────────────────────────────────────┤
│ • Supabase Auth (SSR verification)   │
│ • Dashboard displays:                │
│   - Vehicle info (VIN, make, model)  │
│   - Current readings (RPM, speed)    │
│   - Maintenance history              │
│   - Service schedules                │
│ • User authenticates via email/OTP   │
└──────────────────────────────────────┘
```

### Data Tiers

The OBD backend collects data at three different sampling intervals for efficiency:

| Tier | Interval | Parameters | Purpose |
|------|----------|-----------|---------|
| **1** | 0.5s | RPM, Speed, Engine Load, Throttle Position, MAF | Real-time driving dynamics & MPG calculation |
| **2** | 5s | Coolant Temp, Intake Temp, Battery Voltage, Misfire Counts | Engine health monitoring |
| **3** | 30s | Fuel Level, Warmups since DTC Clear, Distance since DTC Clear | Long-term diagnostics |

## Database Schema

### Frontend (LibSQL/Drizzle ORM)

The frontend maintains 8 core tables:

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `users` | User accounts | `id` (UUID), `email` |
| `cars` | Vehicle catalog | `id`, `year`, `make`, `model`, `vin_prefix`, `manual_pdf_url` |
| `userCars` | User-vehicle relationships | `id`, `userId`, `carId`, `odometer`, `nickname` |
| `maintenanceTasks` | Service types | `id`, `name`, `slug` (e.g., "oil-change") |
| `scheduleItems` | Maintenance intervals | `id`, `carId`, `taskId`, `interval_miles`, `interval_months`, `service_type` |
| `serviceRecords` | Completed services | `id`, `userId`, `carId`, `taskId`, `date`, `odometer`, `cost`, `receipt_url` |
| `sessions` | Trip tracking | `id`, `carId`, `start_time`, `end_time`, `odometer_start`, `odometer_end`, `fuel_used`, `dtc_codes` |
| `sessionData` | Sensor readings per trip | `id`, `sessionId`, `timestamp`, `rpm`, `speed`, `engine_load`, `throttle_position`, `coolant_temp`, `intake_temp` |

### Backend (SQLite)

The Python backend uses SQLAlchemy with two main models:

- **Vehicle** – VIN, make, model, year, NHTSA data
- **OBDData** – Raw diagnostic readings with timestamps
- **ReadingSchema** (Pydantic) – Validation model for incoming OBD data

## Authentication & Security

### Supabase SSR Flow

1. **Sign Up:** User enters email/password → Supabase sends OTP verification link
2. **Email Confirmation:** [auth/confirm/route.ts](frontend/app/auth/confirm) – Handles OTP verification
3. **Session Management:** [middleware.ts](frontend/lib/supabase/middleware.ts) checks auth status on every request
4. **Protected Routes:** `/dashboard`, `/cars`, `/protected` require authentication (unauthenticated users redirected to `/auth/login`)
5. **Logout:** [logout-button.tsx](frontend/components/logout-button.tsx) → `supabase.auth.signOut()`

### Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
```

## API Routes & Endpoints

### Frontend Routes (Server-side Rendered)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Home page | 🏗️ Under construction |
| `/auth/login` | Login page | ✅ Complete |
| `/auth/sign-up` | Sign up page | ✅ Complete |
| `/auth/confirm` | Email OTP verification | ✅ Complete |
| `/auth/forgot-password` | Password recovery | ✅ Complete |
| `/auth/update-password` | Change password | ✅ Complete |
| `/dashboard` | Main vehicle dashboard | ✅ UI Ready, 🔄 Data binding pending |
| `/cars` | Vehicle management | ✅ UI Ready, 🔄 Data binding pending |
| `/protected` | Protected route example | ✅ Complete |

### Backend Endpoints

- **No REST API currently** – Backend is a standalone service
- **Direct Supabase Sync** – OBD data pushed to Supabase `readings` table every 30 seconds
- **Future:** REST API planned for remote OBD queries and manual sync triggers

## Development Guidelines

### Frontend Development

**Code Style:**
- TypeScript for type safety
- React functional components with hooks
- Tailwind CSS for styling
- shadcn/ui for components
- Zod for schema validation

**Workflow:**
```bash
cd frontend
npm run dev              # Start dev server
npm run lint            # Check code style
npm run format          # Auto-format code
npm run typecheck       # Check TypeScript types
npm run build           # Production build
```

### Backend Development

**Code Style:**
- Type hints for Python functions
- Pydantic models for data validation
- SQLAlchemy ORM for database operations
- python-obd library for OBD-II communication

**Workflow:**
```bash
cd obd
python main.py          # Start OBD service
python test_main.py     # Run tests
python test_scripts/obd_test.py  # Test OBD connection
python test_scripts/mpg_test.py  # Test MPG calculation
```

### Common Tasks

**Add a new page:**
1. Create file in `frontend/app/[route]/page.tsx`
2. Add route to middleware exclusions if needed

**Add a database table:**
1. Define schema in `frontend/lib/db/schema.ts`
2. Run Drizzle migrations

**Add a new service type:**
1. Update `maintenanceTasks` enum in `frontend/lib/db/schema.ts`
2. Add corresponding `scheduleItems` for applicable vehicles

## Current Status

### ✅ Completed

- Supabase SSR authentication (login, signup, email verification, password reset)
- OBD-II data collection framework (3-tier multi-parameter sampling)
- Database schemas (frontend Drizzle ORM, backend SQLAlchemy)
- UI components (authentication forms, dashboard cards, sidebar navigation)
- VIN decoding via NHTSA API
- Vehicle management infrastructure
- Email confirmation flow

### 🔄 In Progress

- Dashboard data binding (components built, backend sync in progress)
- Backend REST API (planned for manual queries)
- Maintenance schedule calculations
- Service record creation workflow
- Real-time Supabase table sync optimization

### 📋 TODO

- Add MPG trend analysis
- Implement predictive maintenance alerts
- Add multiple vehicle support UI refinements
- Create admin dashboard for analytics
- Add export reports (PDF/CSV)
- Performance optimization for large datasets

## Contributing

When contributing to NoGas.Init:

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Follow the code style guidelines above
3. Run linting and type checks before committing
4. Ensure all tests pass
5. Create a pull request with a clear description

## License

This project is developed as part of Software Engineering II coursework at Texas A&M University-San Antonio.

## Support

For questions or issues, please open an issue in the repository or contact the development team.
