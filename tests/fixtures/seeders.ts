import { executeSQL, type DbContext } from '../helpers/db'
import { FIXTURES } from './data'

/**
 * Create auth schema and work order tables
 */
export async function createAuthSchema(ctx: DbContext): Promise<void> {
  // Create users table
  await executeSQL(
    ctx,
    `CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL UNIQUE,
      name TEXT,
      email_verified BOOLEAN DEFAULT false,
      image TEXT,
      role TEXT NOT NULL DEFAULT 'EMPLEADO',
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`
  )

  // Create accounts table (for Better Auth)
  await executeSQL(
    ctx,
    `CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      access_token TEXT,
      refresh_token TEXT,
      access_token_expires_at TIMESTAMP,
      refresh_token_expires_at TIMESTAMP,
      scope TEXT,
      id_token TEXT,
      password TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`
  )

  // Create sessions table
  await executeSQL(
    ctx,
    `CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`
  )

  // Create verifications table
  await executeSQL(
    ctx,
    `CREATE TABLE IF NOT EXISTS verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      updated_at TIMESTAMP NOT NULL DEFAULT now()
    )`
  )

  // Create work_orders table
  await executeSQL(
    ctx,
    `CREATE TABLE IF NOT EXISTS work_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP NOT NULL DEFAULT now(),
      created_by UUID NOT NULL REFERENCES users(id),
      client TEXT NOT NULL,
      address TEXT NOT NULL,
      car_number TEXT,
      driver_out TEXT,
      driver_return TEXT
    )`
  )

  // Create work_type enum (idempotent)
  await executeSQL(
    ctx,
    `DO $$ BEGIN
      CREATE TYPE work_type AS ENUM (
        'visita_tecnica', 'oficina', 'obra',
        'punto_recarga', 'postventa', 'averia'
      );
    EXCEPTION WHEN duplicate_object THEN null; END $$`
  )

  // Create work_order_tasks table
  await executeSQL(
    ctx,
    `CREATE TABLE IF NOT EXISTS work_order_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      start_time TIMESTAMP,
      end_time TIMESTAMP,
      project_number TEXT,
      work_type work_type
    )`
  )

  // Create work_order_labor table
  await executeSQL(
    ctx,
    `CREATE TABLE IF NOT EXISTS work_order_labor (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
      technician_name TEXT NOT NULL,
      entry_time TIMESTAMP,
      exit_time TIMESTAMP
    )`
  )

  // Create work_order_materials table
  await executeSQL(
    ctx,
    `CREATE TABLE IF NOT EXISTS work_order_materials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
      units INTEGER NOT NULL,
      description TEXT NOT NULL,
      project TEXT,
      supply TEXT
    )`
  )

  // Create work_order_validations table
  await executeSQL(
    ctx,
    `CREATE TABLE IF NOT EXISTS work_order_validations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
      validated_by UUID NOT NULL REFERENCES users(id),
      validated_at TIMESTAMP NOT NULL DEFAULT now(),
      UNIQUE(work_order_id, validated_by)
    )`
  )
}

/**
 * Seed a user from fixtures
 */
export async function seedUser(
  ctx: DbContext,
  key: keyof typeof FIXTURES.users,
  overrides?: Partial<(typeof FIXTURES.users)[typeof key]>
): Promise<string> {
  const data = { ...FIXTURES.users[key], ...overrides }
  const emailLowercase = data.email.toLowerCase()
  const result = await executeSQL(
    ctx,
    `INSERT INTO users (email, name, role)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [emailLowercase, data.name, data.role ?? 'EMPLEADO']
  )
  return result.rows[0].id
}

/**
 * Seed a session from fixtures
 */
export async function seedSession(
  ctx: DbContext,
  key: keyof typeof FIXTURES.sessions,
  relations: { userId: string },
  overrides?: Partial<(typeof FIXTURES.sessions)[typeof key]>
): Promise<string> {
  const data = { ...FIXTURES.sessions[key], ...overrides }
  const result = await executeSQL(
    ctx,
    `INSERT INTO sessions (user_id, token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [relations.userId, data.token, data.expiresAt]
  )
  return result.rows[0].id
}

/**
 * Seed an account from fixtures
 */
export async function seedAccount(
  ctx: DbContext,
  key: keyof typeof FIXTURES.accounts,
  relations: { userId: string },
  overrides?: Partial<(typeof FIXTURES.accounts)[typeof key]>
): Promise<string> {
  const data = { ...FIXTURES.accounts[key], ...overrides }
  const result = await executeSQL(
    ctx,
    `INSERT INTO accounts (user_id, account_id, provider_id, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [relations.userId, data.accountId, data.providerId, data.password]
  )
  return result.rows[0].id
}

/**
 * Seed a work order from fixtures
 */
export async function seedWorkOrder(
  ctx: DbContext,
  key: keyof typeof FIXTURES.workOrders,
  relations: { createdBy: string },
  overrides?: Partial<(typeof FIXTURES.workOrders)[typeof key]>
): Promise<string> {
  const data = { ...FIXTURES.workOrders[key], ...overrides }
  const result = await executeSQL(
    ctx,
    `INSERT INTO work_orders (created_by, client, address, car_number, driver_out, driver_return)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      relations.createdBy,
      data.client,
      data.address,
      data.carNumber,
      data.driverOut,
      data.driverReturn,
    ]
  )
  return result.rows[0].id
}

/**
 * Seed a work order task from fixtures
 */
export async function seedWorkOrderTask(
  ctx: DbContext,
  key: keyof typeof FIXTURES.workOrderTasks,
  relations: { workOrderId: string },
  overrides?: Partial<(typeof FIXTURES.workOrderTasks)[typeof key]>
): Promise<string> {
  const data = { ...FIXTURES.workOrderTasks[key], ...overrides }
  const result = await executeSQL(
    ctx,
    `INSERT INTO work_order_tasks (work_order_id, description, start_time, end_time, project_number, work_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      relations.workOrderId,
      data.description,
      data.startTime,
      data.endTime,
      data.projectNumber ?? null,
      data.workType ?? null,
    ]
  )
  return result.rows[0].id
}

/**
 * Seed a work order labor entry from fixtures
 */
export async function seedWorkOrderLabor(
  ctx: DbContext,
  key: keyof typeof FIXTURES.workOrderLabor,
  relations: { workOrderId: string },
  overrides?: Partial<(typeof FIXTURES.workOrderLabor)[typeof key]>
): Promise<string> {
  const data = { ...FIXTURES.workOrderLabor[key], ...overrides }
  const result = await executeSQL(
    ctx,
    `INSERT INTO work_order_labor (work_order_id, technician_name, entry_time, exit_time)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [
      relations.workOrderId,
      data.technicianName,
      data.entryTime,
      data.exitTime,
    ]
  )
  return result.rows[0].id
}

/**
 * Seed a work order material from fixtures
 */
export async function seedWorkOrderMaterials(
  ctx: DbContext,
  key: keyof typeof FIXTURES.workOrderMaterials,
  relations: { workOrderId: string },
  overrides?: Partial<(typeof FIXTURES.workOrderMaterials)[typeof key]>
): Promise<string> {
  const data = { ...FIXTURES.workOrderMaterials[key], ...overrides }
  const result = await executeSQL(
    ctx,
    `INSERT INTO work_order_materials (work_order_id, units, description, project, supply)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      relations.workOrderId,
      data.units,
      data.description,
      data.project,
      data.supply,
    ]
  )
  return result.rows[0].id
}

/**
 * Seed a work order validation
 */
export async function seedWorkOrderValidation(
  ctx: DbContext,
  relations: { workOrderId: string; validatedBy: string }
): Promise<string> {
  const result = await executeSQL(
    ctx,
    `INSERT INTO work_order_validations (work_order_id, validated_by)
     VALUES ($1, $2)
     RETURNING id`,
    [relations.workOrderId, relations.validatedBy]
  )
  return result.rows[0].id
}
