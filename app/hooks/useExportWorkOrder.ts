import { useState, useEffect, useRef, useCallback } from 'react'
import { useFetcher } from 'react-router'
import {
  generateWorkOrderPdf,
  buildPdfFilename,
  type WorkOrderExportData,
} from '~/services/workOrderPdf'
import { downloadBlob } from '~/lib/download'

async function downloadWorkOrderPdf(data: WorkOrderExportData) {
  const blob = await generateWorkOrderPdf(data)
  downloadBlob(blob, buildPdfFilename(data))
}

export function useExportWorkOrder() {
  const [isExporting, setIsExporting] = useState(false)

  const exportWorkOrder = useCallback(async (data: WorkOrderExportData) => {
    setIsExporting(true)
    try {
      await downloadWorkOrderPdf(data)
    } finally {
      setIsExporting(false)
    }
  }, [])

  return { exportWorkOrder, isExporting }
}

export function useExportWorkOrderById() {
  const fetcher = useFetcher({ key: 'export-work-order' })
  const lastProcessedData = useRef<unknown>(null)
  const [exportingId, setExportingId] = useState<string | null>(null)
  const isExporting = exportingId !== null

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return
    if (fetcher.data === lastProcessedData.current) return
    if (typeof fetcher.data !== 'object' || !('workOrder' in fetcher.data)) {
      return
    }

    lastProcessedData.current = fetcher.data

    const { workOrder } = fetcher.data as { workOrder: WorkOrderExportData }
    downloadWorkOrderPdf(workOrder).finally(() => {
      setExportingId(null)
    })
  }, [fetcher.state, fetcher.data])

  const exportById = useCallback(
    (id: string) => {
      setExportingId(id)
      lastProcessedData.current = null
      fetcher.load(`/work-orders/${id}`)
    },
    [fetcher],
  )

  return { exportById, isExporting, exportingId }
}
