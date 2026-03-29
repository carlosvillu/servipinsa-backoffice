import { eq } from 'drizzle-orm'
import { db } from '~/db'
import { users, type User, type UserRole } from '~/db/schema/users'

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user
}

export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<void> {
  await db.update(users).set({ role }).where(eq(users.id, userId))
}
