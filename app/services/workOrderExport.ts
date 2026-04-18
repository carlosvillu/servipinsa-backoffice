import { formatDate } from '~/lib/dates'
import type { WorkType } from '~/schemas/workOrder'

export type WorkOrderExportData = {
  client: string
  address: string
  carNumber: string | null
  driverOut: string | null
  driverReturn: string | null
  creatorName: string
  createdAt: string
  tasks: Array<{
    description: string
    startTime: string
    endTime: string
    projectNumber: string | null
    workType: WorkType | null
  }>
  labor: Array<{
    technicianName: string
    entryTime: string
    exitTime: string
  }>
  materials: Array<{
    units: number
    description: string
    project: string | null
    supply: string | null
  }>
}

export function buildExportFilename(
  data: Pick<WorkOrderExportData, 'client' | 'createdAt'>,
  extension: 'pdf' | 'xlsx',
): string {
  const sanitized = data.client
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
  const date = formatDate(data.createdAt).replace(/\//g, '-')
  return `parte-${sanitized}-${date}.${extension}`
}
