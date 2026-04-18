import { Link } from 'react-router'
import type { Route } from './+types/home'
import { requireAuth } from '~/lib/auth.server'
import { listWorkOrders } from '~/services/workOrders.server'
import type { UserRole } from '~/db/schema/users'
import { WorkOrderList } from '~/components/WorkOrderList'
import { ExportAllWorkOrdersButton } from '~/components/ExportAllWorkOrdersButton'
import { Pagination } from '~/components/Pagination'
import { Button } from '~/components/ui/button'
import { useToastFromSearchParams } from '~/hooks/useToastFromSearchParams'

export function meta() {
  return [
    { title: 'Partes de Trabajo — Servipinsa' },
    {
      name: 'description',
      content: 'Gestión de partes de trabajo',
    },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  const authSession = await requireAuth(request)
  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'))

  const result = await listWorkOrders({
    userId: authSession.user.id,
    role: authSession.user.role as UserRole,
    page,
    pageSize: 10,
  })

  return {
    workOrders: result.items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    })),
    pagination: {
      page: result.page,
      totalPages: result.totalPages,
      total: result.total,
    },
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  useToastFromSearchParams({ created: 'Parte de trabajo creado correctamente' })
  const { workOrders, pagination } = loaderData

  return (
    <main className="w-full max-w-6xl mx-auto px-6 md:px-12 py-8 overflow-hidden">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="font-mono text-2xl md:text-3xl uppercase text-[#383838]">
          Partes de Trabajo
        </h1>
        <Button render={<Link to="/work-orders/new" />}>
          Nuevo Parte
        </Button>
      </div>

      <p className="font-mono text-sm text-[#757575] uppercase tracking-wider mb-4">
        {pagination.total} partes
      </p>

      <WorkOrderList items={workOrders} />
      {workOrders.length > 0 && <ExportAllWorkOrdersButton />}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
      />
    </main>
  )
}
