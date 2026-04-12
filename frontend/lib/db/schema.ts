import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** Supabase Auth user id (UUID). */
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
});

export const cars = sqliteTable('cars', {
  id: int('id').primaryKey({ autoIncrement: true }),
  year: int('year').notNull(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  vinPrefix: text('vin_prefix').notNull(),
  manualPdfUrl: text('manual_pdf_url'),
});

export const userCars = sqliteTable('user_cars', {
  id: int('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  carId: int('car_id')
    .notNull()
    .references(() => cars.id),
  currentOdometer: int('current_odometer').notNull(),
  lastOdometerUpdate: int('last_odometer_update', { mode: 'timestamp' }),
  nickname: text('nickname'),
});

export const maintenanceTasks = sqliteTable('maintenance_tasks', {
  id: int('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(),
});

export const scheduleItems = sqliteTable('schedule_items', {
  id: int('id').primaryKey({ autoIncrement: true }),
  carId: int('car_id')
    .notNull()
    .references(() => cars.id),
  taskId: int('task_id')
    .notNull()
    .references(() => maintenanceTasks.id),
  serviceType: text('service_type').notNull(), // 'normal' | 'severe'
  isRecurring: int('is_recurring', { mode: 'boolean' }).notNull(),
  intervalMiles: int('interval_miles'),
  intervalMonths: int('interval_months'),
  milestoneMiles: int('milestone_miles'),
  note: text('note'),
});

export const serviceRecords = sqliteTable('service_records', {
  id: int('id').primaryKey({ autoIncrement: true }),
  userCarId: int('user_car_id')
    .notNull()
    .references(() => userCars.id),
  taskId: int('task_id').references(() => maintenanceTasks.id),
  customTaskName: text('custom_task_name'),
  completedDate: int('completed_date', { mode: 'timestamp' }).notNull(),
  odometerAtService: int('odometer_at_service').notNull(),
  cost: real('cost'),
  receiptUrl: text('receipt_url'),
});

export const sessions = sqliteTable('sessions', {
  id: int('id').primaryKey({ autoIncrement: true }),
  userCarId: int('user_car_id')
    .notNull()
    .references(() => userCars.id),
  startTime: int('start_time', { mode: 'timestamp' }).notNull(),
  endTime: int('end_time', { mode: 'timestamp' }),
  startOdometer: int('start_odometer').notNull(),
  /** Used to auto-update odometer on user_cars when a session ends. */
  endOdometer: int('end_odometer'),
  /** Diagnostic trouble codes captured at session start and end. */
  dtcCodes: text('dtc_codes', { mode: 'json' }).$type<{
    start: string[];
    end: string[];
  }>(),
  fuelStart: real('fuel_start'),
  fuelEnd: real('fuel_end'),
  summary: text('summary', { mode: 'json' }).$type<Record<string, unknown>>(),
});

export const sessionData = sqliteTable('session_data', {
  id: int('id').primaryKey({ autoIncrement: true }),
  userCarId: int('user_car_id')
    .notNull()
    .references(() => userCars.id),
  // 1-second interval samples
  rpm: int('rpm'),
  speed: int('speed'),
  engineLoad: real('engine_load'),
  throttlePos: real('throttle_pos'),
  // 5-second interval samples
  coolantTemp: real('coolant_temp'),
  intakeTemp: real('intake_temp'),
  voltage: real('voltage'),
  longTrim: real('long_trim'),
  isSynced: int('is_synced', { mode: 'boolean' }).notNull().default(false),
});
