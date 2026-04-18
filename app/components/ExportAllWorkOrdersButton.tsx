import { Button } from '~/components/ui/button'
import { useExportAllWorkOrders } from '~/hooks/useExportAllWorkOrders'

export function ExportAllWorkOrdersButton() {
  const { exportAll, isExporting } = useExportAllWorkOrders()

  return (
    <Button onClick={exportAll} disabled={isExporting}>
      {isExporting ? 'Descargando...' : 'Descargar Todo'}
    </Button>
  )
}
