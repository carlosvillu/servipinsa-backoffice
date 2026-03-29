import { Link } from 'react-router'
import type { Route } from './+types/work-orders.$id'
import { requireAuth } from '~/lib/auth.server'
import type { UserRole } from '~/db/schema/users'
import {
  getWorkOrderById,
  canEditWorkOrder,
  dateToTimeString,
} from '~/services/workOrders.server'
import { StatusBadge } from '~/components/StatusBadge'
import { WorkOrderDetail } from '~/components/WorkOrderDetail'
import { WorkOrderValidations } from '~/components/WorkOrderValidations'
import { Button } from '~/components/ui/button'

export function meta({ data }: Route.MetaArgs) {
  const client = data?.workOrder?.client ?? 'Parte'
  return [{ title: `${client} — Servipinsa` }]
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const authSession = await requireAuth(request)
  const role = authSession.user.role as UserRole
  const workOrder = await getWorkOrderById(params.id)

  if (!workOrder) throw new Response('No encontrado', { status: 404 })

  if (role === 'EMPLEADO' && workOrder.createdBy !== authSession.user.id) {
    throw new Response('Sin permisos', { status: 403 })
  }

  const canEdit = canEditWorkOrder(workOrder, authSession.user.id, role)
  const isManager = role === 'MANAGER'
  const isValidated = workOrder.validations.length > 0

  return {
    workOrder: {
      id: workOrder.id,
      createdAt: workOrder.createdAt.toISOString(),
      client: workOrder.client,
      address: workOrder.address,
      carNumber: workOrder.carNumber,
      driverOut: workOrder.driverOut,
      driverReturn: workOrder.driverReturn,
      creatorName: workOrder.creator.name || workOrder.creator.email,
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
        project: m.project,
        supply: m.supply,
      })),
      validations: workOrder.validations.map((v) => ({
        id: v.id,
        validatorName: v.validator.name || v.validator.email,
        validatedAt: v.validatedAt.toISOString(),
      })),
      validationCount: workOrder.validations.length,
    },
    canEdit,
    isManager,
    isValidated,
  }
}

export default function WorkOrderDetailPage({
  loaderData,
}: Route.ComponentProps) {
  const { workOrder, canEdit, isManager, isValidated } = loaderData

  return (
    <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-2xl md:text-3xl uppercase text-[#383838]">
            {workOrder.client}
          </h1>
          <StatusBadge validationCount={workOrder.validationCount} />
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button render={<Link to="edit" />}>Editar</Button>
          )}
          {isManager && !isValidated && (
            <Button disabled>Validar Parte</Button>
          )}
        </div>
      </div>

      <WorkOrderDetail data={workOrder} />

      <div className="mt-8">
        <WorkOrderValidations validations={workOrder.validations} />
      </div>
    </main>
  )
}
