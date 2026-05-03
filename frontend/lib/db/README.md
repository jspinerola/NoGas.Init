# Database layer (Drizzle ORM)

This folder holds the **TypeScript schema** and **DB client** for the frontend app. We use [Drizzle ORM](https://orm.drizzle.team/docs/overview): a lightweight, SQL-centric ORM with optional relational queries, schema-as-code, and Drizzle Kit for migrations.

**Today:** SQLite (file or LibSQL-compatible URL) via `drizzle-orm/libsql`.  
**Planned:** move the same logical schema to **Supabase (PostgreSQL)**. Drizzle supports Postgres natively; migration will mean switching the **driver**, **column types** (e.g. `pgTable` / `serial` / `uuid` where appropriate), and **connection string**—not relearning a different ORM.

---

## Official documentation

Start with the [Drizzle ORM overview](https://orm.drizzle.team/docs/overview), then use these as you work:

| Topic | Doc |
| --- | --- |
| SQLite setup (drivers, connection) | [Get Started — SQLite](https://orm.drizzle.team/docs/get-started-sqlite) |
| Declaring tables & columns | [SQL schema declaration](https://orm.drizzle.team/docs/sql-schema-declaration) |
| `select` / `insert` / `update` / joins | [Select](https://orm.drizzle.team/docs/select) and related query docs |
| Nested reads (`db.query.*`) | [Relational queries](https://orm.drizzle.team/docs/rqb) (optional; needs `relations()` in schema when you add them) |
| Migrations & Drizzle Kit | [Migrations](https://orm.drizzle.team/docs/migrations) |
| PostgreSQL (future Supabase) | [Get Started — PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql) |

---

## Repo layout

| File | Role |
| --- | --- |
| `schema.ts` | Table definitions (`sqliteTable`, columns, FKs). **Source of truth** for structure. |
| `index.ts` | `drizzle(...)` client instance (wired to `DB_FILE_NAME` from env). |
| `../drizzle.config.ts` | Drizzle Kit config: `dialect: 'sqlite'`, schema path, migration output dir. |

Generated SQL migrations (once you run Kit) live under `frontend/drizzle/` per `drizzle.config.ts` (`out: './drizzle'`).

---

## Schema overview

Naming in SQLite is **snake_case**; exports in TypeScript are **camelCase** (e.g. table `user_cars` → `userCars`).

### Users & vehicles

- **`users`** — `id` is the Supabase Auth user UUID (text), even while we still run on SQLite locally.
- **`cars`** — Canonical vehicle (year, make, model, `vin_prefix`, optional `manual_pdf_url`).
- **`user_cars`** — Links a user to a car; `current_odometer`, optional `last_odometer_update`, optional `nickname`.

### Maintenance

- **`maintenance_tasks`** — Task catalog (`name`, unique `slug`, `category`).
- **`schedule_items`** — Per-car schedule: FK to `cars` and `maintenance_tasks`; `service_type` (`'normal' \| 'severe'`), `is_recurring`, optional intervals/milestone/note.
- **`service_records`** — Work done on a **user’s car** (`user_car_id`); optional `task_id`, optional `custom_task_name`, `completed_date`, `odometer_at_service`, optional `cost` / `receipt_url`.

### OBD / telemetry

- **`sessions`** — Drive/session for a `user_car`: times, odometers (`end_odometer` is intended to drive auto-updating odometer on `user_cars`), `dtc_codes` JSON `{ start, end }`, optional fuel and `summary` JSON.
- **`session_data`** — Time-series style rows: high-frequency fields (rpm, speed, engine load, throttle) vs slower fields (temps, voltage, long-term trim); `is_synced`.

JSON columns use SQLite `text` with Drizzle’s `{ mode: 'json' }` and TypeScript `$type<...>()`. Booleans are stored as SQLite integers via `{ mode: 'boolean' }`. Timestamps use `{ mode: 'timestamp' }` on integer columns.

---

## Local setup

1. **Environment** — Set `DB_FILE_NAME` (e.g. `file:./local.db` or a LibSQL URL) in `frontend/.env`. Both `drizzle.config.ts` and `lib/db/index.ts` load config via `dotenv`.
2. **Install** — From `frontend/`: `npm install`.
3. **Migrations** — Follow [Migrations](https://orm.drizzle.team/docs/migrations): use Drizzle Kit to generate SQL from `schema.ts` and apply it to your local file. Typical Kit commands (run from `frontend/`):

   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

   You can also use `drizzle-kit push` for rapid local iteration; prefer generated migrations for anything shared or production-like.

4. **Optional** — `npx drizzle-kit studio` opens a local UI against your configured database.

---

## Using the client in application code

Import the shared `db` from `@/lib/db` (or your app’s alias) and use the SQL-like API from the [Select](https://orm.drizzle.team/docs/select) docs, for example:

```ts
import { db } from '@/lib/db';
import { userCars } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const rows = await db.select().from(userCars).where(eq(userCars.userId, userId));
```

When you add `relations()` to `schema.ts` (or a `relations.ts` file), you can opt into `db.query.userCars.findMany({ with: { ... } })` per [Relational queries](https://orm.drizzle.team/docs/rqb). Until then, stick to `select` / joins.

---

## Moving to Supabase (later)

Supabase is **Postgres**. Plan roughly:

1. Create a Postgres schema mirroring these tables (Drizzle: `pgTable`, Postgres types, `uuid` for `users.id` if you align with Auth).
2. Point Drizzle Kit at `dialect: 'postgresql'` and a Supabase connection string; regenerate or hand-port migrations.
3. Swap the runtime driver from `drizzle-orm/libsql` to `drizzle-orm/node-postgres` or `postgres.js` / serverless driver as recommended in [Get Started — PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql).
4. Revisit SQLite-only details (e.g. JSON/boolean storage) against Postgres types.

Row-level security (RLS) and policies are configured in Supabase, not in Drizzle schema files—keep that in mind when the backend moves.

---

## Questions?

Prefer the [Drizzle docs](https://orm.drizzle.team/docs/overview) and [Discord](https://driz.link/discord) for ORM-specific behavior; pair this README with your team’s conventions for env files and migration review.
