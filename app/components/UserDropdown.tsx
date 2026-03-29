import { Link } from 'react-router'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu'

type UserDropdownProps = {
  user: { email: string; role?: string | null }
  onLogout: () => void | Promise<void>
}

function getInitials(email: string): string {
  const name = email.split('@')[0]
  const parts = name.split(/[._-]/)

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return name.slice(0, 2).toUpperCase()
}

export function UserDropdown({ user, onLogout }: UserDropdownProps) {
  const initials = getInitials(user.email)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#383838] focus:ring-offset-2"
          aria-label="User menu"
        />}
      >
          {/* Avatar: always visible */}
          <div className="w-8 h-8 rounded-full bg-[#383838] text-[#F4EFEA] flex items-center justify-center text-xs font-medium">
            {initials}
          </div>

          {/* Email: desktop only */}
          <span className="hidden md:block text-sm font-mono text-[#757575] truncate max-w-[150px]">
            {user.email}
          </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[200px]">
        {/* Email completo */}
        <div className="px-3 py-2 border-b border-[#E0E0E0]">
          <p className="text-sm font-mono text-[#757575] truncate">{user.email}</p>
        </div>


        {/* Link a dashboard (solo si es podcaster) */}
        {user.role === 'podcaster' && (
          <DropdownMenuItem render={<Link to="/dashboard" />} className="cursor-pointer">
              Dashboard
          </DropdownMenuItem>
        )}

        {/* Logout */}
        <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
