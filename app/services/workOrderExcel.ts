import { formatDate } from '~/lib/dates'
import { WORK_TYPE_LABELS } from '~/schemas/workOrder'
import {
  buildExportFilename,
  type WorkOrderExportData,
} from '~/services/workOrderExport'

export type { WorkOrderExportData }

export const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const HEADER_FILL = {
  type: 'pattern' as const,
  pattern: 'solid' as const,
  fgColor: { argb: 'FF383838' },
}

const HEADER_FONT = {
  bold: true,
  color: { argb: 'FFF4EFEA' },
  name: 'Arial',
  size: 11,
}

export function styleHeaderRow(
  sheet: import('exceljs').Worksheet,
  colCount: number,
) {
  const row = sheet.getRow(1)
  for (let i = 1; i <= colCount; i++) {
    const cell = row.getCell(i)
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { vertical: 'middle', horizontal: 'left' }
  }
  row.height = 24
}

export async function generateWorkOrderExcel(
  data: WorkOrderExportData,
): Promise<Blob> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()

  const general = workbook.addWorksheet('Datos Generales')
  general.columns = [
    { header: 'Campo', key: 'campo', width: 22 },
    { header: 'Valor', key: 'valor', width: 40 },
  ]
  general.addRows([
    { campo: 'Fecha', valor: formatDate(data.createdAt) },
    { campo: 'Cliente', valor: data.client },
    { campo: 'Direccion', valor: data.address },
    { campo: 'Numero de coche', valor: data.carNumber ?? '—' },
    { campo: 'Conductor salida', valor: data.driverOut ?? '—' },
    { campo: 'Conductor retorno', valor: data.driverReturn ?? '—' },
    { campo: 'Creado por', valor: data.creatorName },
  ])
  styleHeaderRow(general, 2)

  const tasks = workbook.addWorksheet('Trabajos Realizados')
  tasks.columns = [
    { header: 'Descripcion', key: 'description', width: 40 },
    { header: 'Numero de proyecto', key: 'projectNumber', width: 20 },
    { header: 'Tipo de trabajo', key: 'workType', width: 20 },
    { header: 'Hora inicio', key: 'startTime', width: 14 },
    { header: 'Hora fin', key: 'endTime', width: 14 },
  ]
  data.tasks.forEach((t) =>
    tasks.addRow({
      description: t.description,
      projectNumber: t.projectNumber ?? '',
      workType: t.workType ? WORK_TYPE_LABELS[t.workType] : '',
      startTime: t.startTime,
      endTime: t.endTime,
    }),
  )
  styleHeaderRow(tasks, 5)

  const labor = workbook.addWorksheet('Mano de Obra')
  labor.columns = [
    { header: 'Tecnico', key: 'technicianName', width: 30 },
    { header: 'Hora entrada', key: 'entryTime', width: 14 },
    { header: 'Hora salida', key: 'exitTime', width: 14 },
  ]
  data.labor.forEach((l) => labor.addRow(l))
  styleHeaderRow(labor, 3)

  const materials = workbook.addWorksheet('Materiales')
  materials.columns = [
    { header: 'Unidades', key: 'units', width: 12 },
    { header: 'Descripcion', key: 'description', width: 40 },
    { header: 'Proyecto', key: 'project', width: 20 },
    { header: 'Suministro', key: 'supply', width: 20 },
  ]
  data.materials.forEach((m) =>
    materials.addRow({
      ...m,
      project: m.project ?? '—',
      supply: m.supply ?? '—',
    }),
  )
  styleHeaderRow(materials, 4)

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], { type: XLSX_MIME_TYPE })
}

export function buildExcelFilename(client: string, createdAt: string): string {
  return buildExportFilename({ client, createdAt }, 'xlsx')
}
