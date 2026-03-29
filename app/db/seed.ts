import dotenv from 'dotenv'

const dbEnv = process.env.DB_ENV || 'development'
const envFile = dbEnv === 'production' ? '.env.production' : '.env.development'
dotenv.config({ path: envFile })
import { db } from './index'
import { users } from './schema'
import { eq } from 'drizzle-orm'
import { auth } from '../lib/auth'

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in environment'
    )
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))

  if (existing.length > 0) {
    await db
      .update(users)
      .set({ role: 'MANAGER' })
      .where(eq(users.email, email.toLowerCase()))
    console.log(`User ${email} already exists — role updated to MANAGER`)
    process.exit(0)
  }

  await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: 'Admin',
    },
  })

  await db
    .update(users)
    .set({ role: 'MANAGER' })
    .where(eq(users.email, email.toLowerCase()))

  console.log(`Admin user created: ${email} with role MANAGER`)
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
