import { useState, useEffect, useRef, useCallback } from 'react'
import { useFetcher } from 'react-router'
import {
  generateWorkOrderExcel,
  buildExcelFilename,
  type WorkOrderExportData,
} from '~/services/workOrderExcel'
import { downloadBlob } from '~/lib/download'

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

export function useExportWorkOrderById() {
  const fetcher = useFetcher({ key: 'export-work-order' })
  const lastProcessedData = useRef<unknown>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportingId, setExportingId] = useState<string | null>(null)

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data === lastProcessedData.current) return
    if (
      typeof fetcher.data !== 'object' ||
      !('workOrder' in fetcher.data)
    ) {
      return
    }

    lastProcessedData.current = fetcher.data

    const workOrder = (fetcher.data as { workOrder: WorkOrderExportData })
      .workOrder
    generateWorkOrderExcel(workOrder)
      .then((blob) => {
        downloadBlob(
          blob,
          buildExcelFilename(workOrder.client, workOrder.createdAt),
        )
      })
      .finally(() => {
        setIsExporting(false)
        setExportingId(null)
      })
  }, [fetcher.state, fetcher.data])

  const exportById = useCallback(
    (id: string) => {
      setExportingId(id)
      setIsExporting(true)
      lastProcessedData.current = null
      fetcher.load(`/work-orders/${id}`)
    },
    [fetcher],
  )

  return { exportById, isExporting, exportingId }
}
