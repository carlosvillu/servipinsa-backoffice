CREATE TYPE "public"."work_type" AS ENUM('visita_tecnica', 'oficina', 'obra', 'punto_recarga', 'postventa', 'averia');--> statement-breakpoint
ALTER TABLE "work_order_tasks" ADD COLUMN "project_number" text;--> statement-breakpoint
ALTER TABLE "work_order_tasks" ADD COLUMN "work_type" "work_type";