import { Button } from '~/components/ui/button'
import { useExportAllWorkOrders } from '~/hooks/useExportAllWorkOrders'

export function ExportAllWorkOrdersButton() {
  const { exportAll, isExporting } = useExportAllWorkOrders()

  return (
    <div className="mt-6 flex justify-end">
      <Button onClick={exportAll} disabled={isExporting}>
        {isExporting ? 'Descargando...' : 'Descargar Todo'}
      </Button>
    </div>
  )
}
