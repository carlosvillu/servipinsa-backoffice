import { useEffect } from 'react'
import { data, useActionData } from 'react-router'
import { toast } from 'sonner'
import type { Route } from './+types/users'
import { requireManager } from '~/lib/authorization.server'
import type { UserRole } from '~/db/schema/users'
import {
  listUsers,
  createUser,
  promoteToManager,
} from '~/services/users.server'
import { UserList } from '~/components/UserList'
import { CreateUserDialog } from '~/components/CreateUserDialog'
import { PromoteUserDialog } from '~/components/PromoteUserDialog'

export function meta() {
  return [{ title: 'Usuarios — Servipinsa' }]
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireManager(request)
  const userList = await listUsers()
  return {
    users: userList.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role as UserRole,
    })),
  }
}

export async function action({ request }: Route.ActionArgs) {
  await requireManager(request)
  const formData = await request.formData()
  const intent = formData.get('_action')

  if (intent === 'create') {
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    const name = String(formData.get('name') ?? '')
    const result = await createUser({ email, password, name })
    if (!result.success) {
      return data({ error: result.error }, { status: 400 })
    }
    return data({ ok: true, intent: 'create' as const })
  }

  if (intent === 'promote') {
    const userId = formData.get('userId') as string
    if (!userId) {
      return data({ error: 'userId requerido' }, { status: 400 })
    }
    await promoteToManager(userId)
    return data({ ok: true, intent: 'promote' as const })
  }

  return data({ error: 'Acción desconocida' }, { status: 400 })
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  const actionData = useActionData<typeof action>()
  const { users } = loaderData

  useEffect(() => {
    if (actionData && 'ok' in actionData && actionData.ok) {
      if (actionData.intent === 'create') {
        toast.success('Usuario creado correctamente')
      }
      if (actionData.intent === 'promote') {
        toast.success('Usuario promovido a Manager correctamente')
      }
    }
  }, [actionData])

  return (
    <main className="w-full max-w-6xl mx-auto px-6 md:px-12 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="font-mono text-2xl md:text-3xl uppercase text-[#383838]">
          Usuarios
        </h1>
        <CreateUserDialog />
      </div>
      <p className="font-mono text-sm text-[#757575] uppercase tracking-wider mb-4">
        {users.length} usuarios
      </p>
      <UserList
        items={users}
        renderActions={(user) =>
          user.role === 'EMPLEADO' ? (
            <PromoteUserDialog
              userId={user.id}
              userName={user.name || user.email}
            />
          ) : null
        }
      />
    </main>
  )
}
