import type { Route } from './+types/work-orders.export-all'
import { requireAuth } from '~/lib/auth.server'
import { listAllWorkOrderLaborRows } from '~/services/workOrders.server'
import type { UserRole } from '~/db/schema/users'

export async function loader({ request }: Route.LoaderArgs) {
  const authSession = await requireAuth(request)
  const rows = await listAllWorkOrderLaborRows({
    userId: authSession.user.id,
    role: authSession.user.role as UserRole,
  })
  return { rows }
}
