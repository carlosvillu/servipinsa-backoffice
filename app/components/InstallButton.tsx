import { Download } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { usePWAInstall } from '~/hooks/usePWAInstall'

export function InstallButton() {
  const { canInstall, install } = usePWAInstall()

  if (!canInstall) return null

  return (
    <Button size="sm" onClick={install} aria-label="Instalar app">
      <Download size={16} />
      <span className="hidden sm:inline">Instalar app</span>
    </Button>
  )
}
