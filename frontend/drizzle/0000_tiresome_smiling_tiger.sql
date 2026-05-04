CREATE SCHEMA "auth";
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"year" integer NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"vin_prefix" text NOT NULL,
	"manual_pdf_url" text
);
--> statement-breakpoint
CREATE TABLE "maintenance_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	CONSTRAINT "maintenance_tasks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "schedule_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"car_id" integer NOT NULL,
	"task_id" integer NOT NULL,
	"service_type" text NOT NULL,
	"is_recurring" boolean NOT NULL,
	"interval_miles" integer,
	"interval_months" integer,
	"milestone_miles" integer,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "service_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_car_id" integer NOT NULL,
	"task_id" integer,
	"custom_task_name" text,
	"completed_date" timestamp NOT NULL,
	"odometer_at_service" integer NOT NULL,
	"cost" double precision,
	"receipt_url" text
);
--> statement-breakpoint
CREATE TABLE "session_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"timestamp" timestamp NOT NULL,
	"rpm" integer,
	"speed" integer,
	"engine_load" double precision,
	"throttle_pos" double precision,
	"coolant_temp" double precision,
	"intake_temp" double precision,
	"voltage" double precision,
	"long_trim" double precision,
	"is_synced" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_car_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"start_odometer" integer NOT NULL,
	"end_odometer" integer,
	"dtc_codes" jsonb,
	"fuel_start" double precision,
	"fuel_end" double precision,
	"summary" jsonb
);
--> statement-breakpoint
CREATE TABLE "user_cars" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"car_id" integer NOT NULL,
	"current_odometer" integer NOT NULL,
	"last_odometer_update" timestamp,
	"nickname" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_task_id_maintenance_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."maintenance_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_user_car_id_user_cars_id_fk" FOREIGN KEY ("user_car_id") REFERENCES "public"."user_cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_records" ADD CONSTRAINT "service_records_task_id_maintenance_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."maintenance_tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_data" ADD CONSTRAINT "session_data_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_car_id_user_cars_id_fk" FOREIGN KEY ("user_car_id") REFERENCES "public"."user_cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cars" ADD CONSTRAINT "user_cars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_cars" ADD CONSTRAINT "user_cars_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;