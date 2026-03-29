import { data } from 'react-router'
import type { Route } from './+types/users'
import { requireManager } from '~/lib/authorization.server'
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
      ...u,
      createdAt: u.createdAt.toISOString(),
    })),
  }
}

export async function action({ request }: Route.ActionArgs) {
  await requireManager(request)
  const formData = await request.formData()
  const intent = formData.get('_action')

  if (intent === 'create') {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const result = await createUser({ email, password, name })
    if (!result.success) {
      return data({ error: result.error }, { status: 400 })
    }
    return data({ ok: true })
  }

  if (intent === 'promote') {
    const userId = formData.get('userId') as string
    if (!userId) {
      return data({ error: 'userId requerido' }, { status: 400 })
    }
    await promoteToManager(userId)
    return data({ ok: true })
  }

  return data({ error: 'Acción desconocida' }, { status: 400 })
}

export default function UsersPage({ loaderData }: Route.ComponentProps) {
  const { users } = loaderData

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
