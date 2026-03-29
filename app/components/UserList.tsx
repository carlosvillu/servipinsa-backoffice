import type { ReactNode } from 'react'
import type { UserRole } from '~/db/schema/users'
import { RoleBadge } from '~/components/RoleBadge'

export type UserListItemData = {
  id: string
  name: string | null
  email: string
  role: UserRole
}

type UserListProps = {
  items: UserListItemData[]
  renderActions?: (user: UserListItemData) => ReactNode
}

const thClass =
  'text-left font-mono text-xs uppercase tracking-wider text-[#757575] py-3 px-4'
const tdClass = 'py-3 px-4 text-sm text-[#383838]'

export function UserList({ items, renderActions }: UserListProps) {
  if (items.length === 0) {
    return (
      <div className="border border-[#E0E0E0] p-12 text-center">
        <p className="font-mono text-sm text-[#757575] uppercase">
          No hay usuarios.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block border border-[#E0E0E0]">
        <table className="w-full">
          <thead className="border-b border-[#E0E0E0]">
            <tr>
              <th className={thClass}>Nombre</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Rol</th>
              <th className={thClass}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr
                key={user.id}
                className="border-b border-[#E0E0E0] last:border-b-0"
              >
                <td className={tdClass}>{user.name || '—'}</td>
                <td className={tdClass}>{user.email}</td>
                <td className={tdClass}>
                  <RoleBadge role={user.role} />
                </td>
                <td className={tdClass}>
                  {renderActions ? renderActions(user) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {items.map((user) => (
          <div
            key={user.id}
            className="border border-[#E0E0E0] p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-medium text-[#383838]">
                {user.name || '—'}
              </span>
              <RoleBadge role={user.role} />
            </div>
            <span className="text-sm text-[#757575]">{user.email}</span>
            {renderActions ? (
              <div className="mt-1">{renderActions(user)}</div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  )
}
