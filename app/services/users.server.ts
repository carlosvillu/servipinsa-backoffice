import { desc, eq } from 'drizzle-orm'
import { db } from '~/db'
import { users, type User, type UserRole } from '~/db/schema/users'
import { auth } from '~/lib/auth'
import {
  createUserSchema,
  type CreateUserInput,
} from '~/schemas/user'

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

export async function listUsers(): Promise<
  Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>[]
> {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
}

export async function createUser(
  input: CreateUserInput
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = createUserSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.flatten().formErrors.join(', '),
    }
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
      },
    })
    return { success: true }
  } catch {
    return {
      success: false,
      error:
        'No se pudo crear el usuario. Es posible que el email ya exista.',
    }
  }
}

export async function promoteToManager(userId: string): Promise<void> {
  await updateUserRole(userId, 'MANAGER')
}
