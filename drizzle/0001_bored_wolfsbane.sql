CREATE TABLE "work_order_labor" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"technician_name" text NOT NULL,
	"entry_time" timestamp,
	"exit_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "work_order_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"units" integer NOT NULL,
	"description" text NOT NULL,
	"project" text,
	"supply" text
);
--> statement-breakpoint
CREATE TABLE "work_order_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"description" text NOT NULL,
	"start_time" timestamp,
	"end_time" timestamp
);
--> statement-breakpoint
CREATE TABLE "work_order_validations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"work_order_id" uuid NOT NULL,
	"validated_by" uuid NOT NULL,
	"validated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	"client" text NOT NULL,
	"address" text NOT NULL,
	"car_number" text,
	"driver_out" text,
	"driver_return" text
);
--> statement-breakpoint
ALTER TABLE "work_order_labor" ADD CONSTRAINT "work_order_labor_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_materials" ADD CONSTRAINT "work_order_materials_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_tasks" ADD CONSTRAINT "work_order_tasks_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_validations" ADD CONSTRAINT "work_order_validations_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_validations" ADD CONSTRAINT "work_order_validations_validated_by_users_id_fk" FOREIGN KEY ("validated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;