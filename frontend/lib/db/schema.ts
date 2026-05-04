import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgSchema,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

/** Supabase Auth internal schema */
export const authSchema = pgSchema("auth")
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
})

/** Public users table referencing auth.users */
export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
})

export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  vinPrefix: text("vin_prefix").notNull(),
  manualPdfUrl: text("manual_pdf_url"),
})

export const userCars = pgTable("user_cars", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id),
  currentOdometer: integer("current_odometer").notNull(),
  lastOdometerUpdate: timestamp("last_odometer_update"),
  nickname: text("nickname"),
})

export const maintenanceTasks = pgTable("maintenance_tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
})

export const scheduleItems = pgTable("schedule_items", {
  id: serial("id").primaryKey(),
  carId: integer("car_id")
    .notNull()
    .references(() => cars.id),
  taskId: integer("task_id")
    .notNull()
    .references(() => maintenanceTasks.id),
  serviceType: text("service_type").notNull(), // 'normal' | 'severe'
  isRecurring: boolean("is_recurring").notNull(),
  intervalMiles: integer("interval_miles"),
  intervalMonths: integer("interval_months"),
  milestoneMiles: integer("milestone_miles"),
  note: text("note"),
})

export const serviceRecords = pgTable("service_records", {
  id: serial("id").primaryKey(),
  userCarId: integer("user_car_id")
    .notNull()
    .references(() => userCars.id),
  taskId: integer("task_id").references(() => maintenanceTasks.id),
  customTaskName: text("custom_task_name"),
  completedDate: timestamp("completed_date").notNull(),
  odometerAtService: integer("odometer_at_service").notNull(),
  cost: doublePrecision("cost"),
  receiptUrl: text("receipt_url"),
})

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userCarId: integer("user_car_id")
    .notNull()
    .references(() => userCars.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  startOdometer: integer("start_odometer").notNull(),
  /** Used to auto-update odometer on user_cars when a session ends. */
  endOdometer: integer("end_odometer"),
  /** Diagnostic trouble codes captured at session start and end. */
  dtcCodes: jsonb("dtc_codes").$type<{
    start: string[]
    end: string[]
  }>(),
  fuelStart: doublePrecision("fuel_start"),
  fuelEnd: doublePrecision("fuel_end"),
  summary: jsonb("summary").$type<Record<string, unknown>>(),
})

export const sessionData = pgTable("session_data", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull(),
  // 1-second interval samples
  rpm: integer("rpm"),
  speed: integer("speed"),
  engineLoad: doublePrecision("engine_load"),
  throttlePos: doublePrecision("throttle_pos"),
  // 5-second interval samples
  coolantTemp: doublePrecision("coolant_temp"),
  intakeTemp: doublePrecision("intake_temp"),
  voltage: doublePrecision("voltage"),
  longTrim: doublePrecision("long_trim"),
  isSynced: boolean("is_synced").notNull().default(false),
})
