import { useCallback, useEffect, useRef, useState } from 'react'
import { useFetcher } from 'react-router'
import {
  buildWorkOrdersLaborExcelFilename,
  generateWorkOrdersLaborExcel,
} from '~/services/workOrderExcelAll'
import type { WorkOrderLaborRow } from '~/services/workOrders.server'
import { downloadBlob } from '~/lib/download'

export function useExportAllWorkOrders() {
  const fetcher = useFetcher({ key: 'export-all-work-orders' })
  const lastProcessedData = useRef<unknown>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data === lastProcessedData.current) return
    if (typeof fetcher.data !== 'object' || !('rows' in fetcher.data)) {
      return
    }

    lastProcessedData.current = fetcher.data

    const { rows } = fetcher.data as { rows: WorkOrderLaborRow[] }
    generateWorkOrdersLaborExcel(rows)
      .then((blob) => downloadBlob(blob, buildWorkOrdersLaborExcelFilename()))
      .finally(() => setIsExporting(false))
  }, [fetcher.state, fetcher.data])

  const exportAll = useCallback(() => {
    setIsExporting(true)
    lastProcessedData.current = null
    fetcher.load('/work-orders/export-all')
  }, [fetcher])

  return { exportAll, isExporting }
}
