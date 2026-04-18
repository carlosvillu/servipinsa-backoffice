import { formatDate, formatDateYMD } from '~/lib/dates'
import { styleHeaderRow } from '~/services/workOrderExcel'
import type { WorkOrderLaborRow } from '~/services/workOrders.server'

export async function generateWorkOrdersLaborExcel(
  rows: WorkOrderLaborRow[],
): Promise<Blob> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()

  const sheet = workbook.addWorksheet('Partes')
  sheet.columns = [
    { header: 'Fecha', key: 'date', width: 14 },
    { header: 'Operario', key: 'technicianName', width: 30 },
    { header: 'Hora de inicio', key: 'entryTime', width: 16 },
    { header: 'Hora de Fin', key: 'exitTime', width: 16 },
  ]

  rows.forEach((row) =>
    sheet.addRow({
      date: formatDate(row.date),
      technicianName: row.technicianName,
      entryTime: row.entryTime,
      exitTime: row.exitTime,
    }),
  )

  styleHeaderRow(sheet, 4)

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export function buildWorkOrdersLaborExcelFilename(): string {
  return `partes-trabajo-${formatDateYMD(new Date())}.xlsx`
}
