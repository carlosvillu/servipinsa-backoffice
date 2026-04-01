import { formatDate } from '~/lib/dates'

export type WorkOrderExportData = {
  client: string
  address: string
  carNumber: string | null
  driverOut: string | null
  driverReturn: string | null
  creatorName: string
  createdAt: string
  tasks: Array<{ description: string; startTime: string; endTime: string }>
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

function styleHeaderRow(
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

  // Sheet 1: Datos Generales
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

  // Sheet 2: Trabajos Realizados
  const tasks = workbook.addWorksheet('Trabajos Realizados')
  tasks.columns = [
    { header: 'Descripcion', key: 'description', width: 40 },
    { header: 'Hora inicio', key: 'startTime', width: 14 },
    { header: 'Hora fin', key: 'endTime', width: 14 },
  ]
  data.tasks.forEach((t) => tasks.addRow(t))
  styleHeaderRow(tasks, 3)

  // Sheet 3: Mano de Obra
  const labor = workbook.addWorksheet('Mano de Obra')
  labor.columns = [
    { header: 'Tecnico', key: 'technicianName', width: 30 },
    { header: 'Hora entrada', key: 'entryTime', width: 14 },
    { header: 'Hora salida', key: 'exitTime', width: 14 },
  ]
  data.labor.forEach((l) => labor.addRow(l))
  styleHeaderRow(labor, 3)

  // Sheet 4: Materiales
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
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function buildExcelFilename(client: string, createdAt: string): string {
  const sanitized = client
    .replace(/[^a-zA-Z0-9\u00e1\u00e9\u00ed\u00f3\u00fa\u00f1\u00c1\u00c9\u00cd\u00d3\u00da\u00d1\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
  const date = formatDate(createdAt).replace(/\//g, '-')
  return `parte-${sanitized}-${date}.xlsx`
}
