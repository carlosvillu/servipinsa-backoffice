import { data, redirect } from 'react-router'
import type { Route } from './+types/work-orders.new'
import { requireAuth } from '~/lib/auth.server'
import { createWorkOrder } from '~/services/workOrders.server'
import { workOrderFormSchema } from '~/schemas/workOrder'
import { WorkOrderForm } from '~/components/WorkOrderForm'

export function meta() {
  return [{ title: 'Nuevo Parte de Trabajo — Servipinsa' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request)
  return {}
}

export async function action({ request }: Route.ActionArgs) {
  const authSession = await requireAuth(request)
  const formData = await request.formData()
  const jsonString = formData.get('_json')

  if (typeof jsonString !== 'string') {
    return data({ errors: { formErrors: ['Datos invalidos'] } }, { status: 400 })
  }

  let jsonData: unknown
  try {
    jsonData = JSON.parse(jsonString)
  } catch {
    return data({ errors: { formErrors: ['Datos invalidos'] } }, { status: 400 })
  }

  const parsed = workOrderFormSchema.safeParse(jsonData)

  if (!parsed.success) {
    return data(
      { errors: parsed.error.flatten() },
      { status: 400 }
    )
  }

  await createWorkOrder(parsed.data, authSession.user.id)
  throw redirect('/?toast=created')
}

export default function WorkOrderNewPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-8">
      <h1 className="font-mono text-2xl md:text-3xl uppercase text-[#383838] mb-8">
        Nuevo Parte de Trabajo
      </h1>
      <WorkOrderForm />
    </main>
  )
}
