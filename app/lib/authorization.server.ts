import { requireAuth, type AuthSession } from './auth.server'
import type { UserRole } from '~/db/schema/users'

export async function requireManager(request: Request): Promise<AuthSession> {
  const authSession = await requireAuth(request)

  if (authSession.user.role !== 'MANAGER') {
    throw new Response('Forbidden', { status: 403 })
  }

  return authSession
}

export async function getUserRole(request: Request): Promise<UserRole> {
  const authSession = await requireAuth(request)
  return authSession.user.role as UserRole
}
