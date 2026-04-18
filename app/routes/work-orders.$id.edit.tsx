import { data, redirect } from 'react-router'
import type { Route } from './+types/work-orders.$id.edit'
import { requireAuth } from '~/lib/auth.server'
import type { UserRole } from '~/db/schema/users'
import {
  getWorkOrderById,
  canEditWorkOrder,
  updateWorkOrder,
  dateToTimeString,
} from '~/services/workOrders.server'
import { workOrderFormSchema } from '~/schemas/workOrder'
import { WorkOrderForm } from '~/components/WorkOrderForm'
import { formatDateYMD } from '~/lib/dates'

export function meta() {
  return [{ title: 'Editar Parte — Servipinsa' }]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const authSession = await requireAuth(request)
  const role = authSession.user.role as UserRole
  const workOrder = await getWorkOrderById(params.id)

  if (!workOrder) throw new Response('No encontrado', { status: 404 })

  if (!canEditWorkOrder(workOrder, authSession.user.id, role)) {
    throw redirect(`/work-orders/${params.id}`)
  }

  return {
    defaultValues: {
      createdAt: formatDateYMD(workOrder.createdAt),
      client: workOrder.client,
      address: workOrder.address,
      carNumber: workOrder.carNumber || '',
      driverOut: workOrder.driverOut || '',
      driverReturn: workOrder.driverReturn || '',
      tasks: workOrder.tasks.map((t) => ({
        description: t.description,
        startTime: dateToTimeString(t.startTime),
        endTime: dateToTimeString(t.endTime),
      })),
      labor: workOrder.labor.map((l) => ({
        technicianName: l.technicianName,
        entryTime: dateToTimeString(l.entryTime),
        exitTime: dateToTimeString(l.exitTime),
      })),
      materials: workOrder.materials.map((m) => ({
        units: m.units,
        description: m.description,
        project: m.project || '',
        supply: m.supply || '',
      })),
    },
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const authSession = await requireAuth(request)
  const role = authSession.user.role as UserRole
  const formData = await request.formData()
  const jsonString = formData.get('_json')

  if (typeof jsonString !== 'string') {
    return data({ errors: { formErrors: ['Datos invalidos'] } }, { status: 400 })
  }

  let json: unknown
  try {
    json = JSON.parse(jsonString)
  } catch {
    return data({ errors: { formErrors: ['Datos invalidos'] } }, { status: 400 })
  }

  const parsed = workOrderFormSchema.safeParse(json)

  if (!parsed.success) {
    return data({ errors: parsed.error.flatten() }, { status: 400 })
  }

  await updateWorkOrder(params.id, parsed.data, authSession.user.id, role)
  throw redirect(`/work-orders/${params.id}?toast=updated`)
}

export default function WorkOrderEditPage({ loaderData }: Route.ComponentProps) {
  return (
    <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-8">
      <h1 className="font-mono text-2xl md:text-3xl uppercase text-[#383838] mb-6">
        Editar Parte de Trabajo
      </h1>
      <WorkOrderForm
        defaultValues={loaderData.defaultValues}
        submitLabel="Guardar Cambios"
      />
    </main>
  )
}
