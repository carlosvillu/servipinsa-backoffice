import { Link } from 'react-router'
import { X } from 'lucide-react'
import type { User } from '~/lib/auth'

type MobileSidebarProps = {
  open: boolean
  onClose: () => void
  user: User
  onLogout: () => void
}

const navLinkClass =
  'font-mono uppercase tracking-wider text-sm text-[#383838] py-3 border-b border-[#E0E0E0] hover:text-[#2BA5FF] transition-colors'

export function MobileSidebar({
  open,
  onClose,
  user,
  onLogout,
}: MobileSidebarProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="fixed inset-0 bg-[#383838]/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <nav className="fixed top-0 left-0 bottom-0 w-64 bg-[#F4EFEA] border-r border-[#383838] flex flex-col">
        <div className="h-[70px] px-6 flex items-center justify-between border-b border-[#383838]">
          <span className="font-mono text-xl font-bold uppercase tracking-tighter flex items-center gap-2">
            <span className="inline-block w-4 h-4 bg-[#2BA5FF] border border-[#383838]" />
            Servipinsa
          </span>
          <button
            onClick={onClose}
            className="text-[#383838] p-1"
            aria-label="Cerrar menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 py-6 gap-2">
          <Link to="/" onClick={onClose} className={navLinkClass}>
            Partes
          </Link>
          {user.role === 'MANAGER' && (
            <Link to="/users" onClick={onClose} className={navLinkClass}>
              Usuarios
            </Link>
          )}
        </div>

        <div className="px-6 py-6 border-t border-[#383838]">
          <p className="font-sans text-xs text-[#757575] mb-3 truncate">
            {user.email}
          </p>
          <button
            onClick={() => {
              onLogout()
              onClose()
            }}
            className="font-mono uppercase tracking-wider text-sm text-[#383838] hover:text-[#2BA5FF] transition-colors"
          >
            Cerrar sesion
          </button>
        </div>
      </nav>
    </div>
  )
}
