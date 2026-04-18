import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Menu } from 'lucide-react'
import { authClient } from '~/lib/auth.client'
import { Button } from '~/components/ui/button'
import { UserDropdown } from '~/components/UserDropdown'
import { MobileSidebar } from '~/components/MobileSidebar'
import { InstallButton } from '~/components/InstallButton'
import type { Session, User } from '~/lib/auth'

type HeaderProps = {
  session: Session | null
  user: User | null
}

export function Header({ session, user }: HeaderProps) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await authClient.signOut()
    navigate('/')
  }

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-[#F4EFEA]/90 backdrop-blur-sm border-b border-[#383838]">
        <div className="max-w-6xl mx-auto h-[70px] md:h-[90px] px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="font-mono text-2xl font-bold uppercase tracking-tighter flex items-center gap-2"
          >
            <div className="w-4 h-4 bg-[#2BA5FF] border border-[#383838]" />
            Servipinsa
          </Link>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            <InstallButton />
            {session && user ? (
              <>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-[#383838] p-2"
                  aria-label="Abrir menu"
                >
                  <Menu size={24} />
                </button>
                <div className="hidden md:block">
                  <UserDropdown user={user} onLogout={handleLogout} />
                </div>
              </>
            ) : (
              <Button
                render={<Link to="/auth/login" />}
                size="sm"
                className="font-mono uppercase bg-[#383838] text-[#F4EFEA] px-6 py-3 border border-[#383838] hover:bg-[#2BA5FF] hover:border-[#2BA5FF] hover:text-white transition-all"
              >
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </header>
      {session && user && (
        <MobileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}
