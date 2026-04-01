import { useState, useEffect, useRef, useCallback } from 'react'
import { useFetcher } from 'react-router'
import {
  generateWorkOrderExcel,
  downloadBlob,
  buildExcelFilename,
  type WorkOrderExportData,
} from '~/services/workOrderExcel'

export function useExportWorkOrder() {
  const [isExporting, setIsExporting] = useState(false)

  const exportWorkOrder = useCallback(async (data: WorkOrderExportData) => {
    setIsExporting(true)
    try {
      const blob = await generateWorkOrderExcel(data)
      downloadBlob(blob, buildExcelFilename(data.client, data.createdAt))
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { exportWorkOrder, isExporting }
}

export function useExportWorkOrderById(id: string) {
  const fetcher = useFetcher({ key: `export-wo-${id}` })
  const pendingExport = useRef(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (!pendingExport.current || fetcher.state !== 'idle' || !fetcher.data) {
      return
    }
    pendingExport.current = false

    const workOrder = (fetcher.data as { workOrder: WorkOrderExportData })
      .workOrder
    generateWorkOrderExcel(workOrder)
      .then((blob) => {
        downloadBlob(
          blob,
          buildExcelFilename(workOrder.client, workOrder.createdAt),
        )
      })
      .finally(() => setIsExporting(false))
  }, [fetcher.state, fetcher.data])

  const exportById = useCallback(() => {
    pendingExport.current = true
    setIsExporting(true)
    fetcher.load(`/work-orders/${id}`)
  }, [id, fetcher])

  return { exportById, isExporting }
}
