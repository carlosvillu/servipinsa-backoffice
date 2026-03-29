import type { UserRole } from '~/db/schema/users'

export function RoleBadge({ role }: { role: UserRole }) {
  if (role === 'MANAGER') {
    return (
      <span className="inline-block bg-[#2BA5FF] text-white font-mono uppercase text-xs px-2 py-1">
        Manager
      </span>
    )
  }
  return (
    <span className="inline-block border border-[#757575] text-[#757575] font-mono uppercase text-xs px-2 py-1">
      Empleado
    </span>
  )
}
