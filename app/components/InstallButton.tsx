import { Download } from 'lucide-react'
import { usePWAInstall } from '~/hooks/usePWAInstall'

export function InstallButton() {
  const { canInstall, install } = usePWAInstall()

  if (!canInstall) return null

  return (
    <button
      type="button"
      onClick={install}
      className="font-mono uppercase text-sm bg-[#383838] text-[#F4EFEA] px-4 py-2 border border-[#383838] hover:bg-[#2BA5FF] hover:border-[#2BA5FF] hover:text-white transition-all flex items-center gap-2"
      aria-label="Instalar app"
    >
      <Download size={16} />
      <span className="hidden sm:inline">Instalar app</span>
    </button>
  )
}
