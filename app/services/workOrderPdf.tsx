import { formatDate } from '~/lib/dates'
import { WORK_TYPE_LABELS } from '~/schemas/workOrder'
import type { WorkOrderExportData } from '~/services/workOrderExcel'

export type { WorkOrderExportData }

export async function generateWorkOrderPdf(
  data: WorkOrderExportData,
): Promise<Blob> {
  const { Document, Page, StyleSheet, Text, View, pdf } = await import(
    '@react-pdf/renderer'
  )

  const styles = StyleSheet.create({
    page: {
      paddingTop: 28,
      paddingBottom: 32,
      paddingHorizontal: 32,
      fontFamily: 'Helvetica',
      fontSize: 9,
      color: '#1a1a1a',
    },
    section: { marginBottom: 16 },
    sectionTitle: {
      fontFamily: 'Courier',
      fontSize: 13,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      backgroundColor: '#383838',
      color: '#f4efea',
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginBottom: 6,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    gridCell: {
      width: '50%',
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    label: {
      fontSize: 7,
      textTransform: 'uppercase',
      color: '#757575',
      marginBottom: 2,
    },
    value: { fontSize: 10 },
    valueMono: { fontSize: 10, fontFamily: 'Courier' },
    table: {
      borderWidth: 1,
      borderColor: '#d9d4cf',
      borderStyle: 'solid',
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#383838',
    },
    tableHeaderCell: {
      flex: 1,
      padding: 6,
      color: '#f4efea',
      fontSize: 8,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: '#d9d4cf',
      borderTopStyle: 'solid',
    },
    tableCell: {
      flex: 1,
      padding: 6,
      fontSize: 9,
    },
    tableCellMono: {
      flex: 1,
      padding: 6,
      fontSize: 9,
      fontFamily: 'Courier',
    },
    empty: {
      fontFamily: 'Courier',
      fontSize: 9,
      color: '#757575',
      padding: 6,
    },
  })

  function Field({ label, value }: { label: string; value: string | null }) {
    return (
      <View style={styles.gridCell}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value && value.length > 0 ? value : '—'}</Text>
      </View>
    )
  }

  const doc = (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Generales</Text>
          <View style={styles.grid}>
            <Field label="Cliente" value={data.client} />
            <Field label="Direccion" value={data.address} />
            <Field label="Numero de coche" value={data.carNumber} />
            <Field label="Conductor salida" value={data.driverOut} />
            <Field label="Conductor retorno" value={data.driverReturn} />
            <Field label="Creado por" value={data.creatorName} />
            <Field label="Fecha" value={formatDate(data.createdAt)} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajos Realizados</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
              <Text style={styles.tableHeaderCell}>Descripcion</Text>
              <Text style={styles.tableHeaderCell}>Numero de proyecto</Text>
              <Text style={styles.tableHeaderCell}>Tipo de trabajo</Text>
              <Text style={styles.tableHeaderCell}>Hora inicio</Text>
              <Text style={styles.tableHeaderCell}>Hora fin</Text>
            </View>
            {data.tasks.map((t, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={styles.tableCell}>{t.description}</Text>
                <Text style={styles.tableCellMono}>{t.projectNumber || '—'}</Text>
                <Text style={styles.tableCell}>
                  {t.workType ? WORK_TYPE_LABELS[t.workType] : '—'}
                </Text>
                <Text style={styles.tableCellMono}>{t.startTime}</Text>
                <Text style={styles.tableCellMono}>{t.endTime}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mano de Obra</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader} fixed>
              <Text style={styles.tableHeaderCell}>Tecnico</Text>
              <Text style={styles.tableHeaderCell}>Hora entrada</Text>
              <Text style={styles.tableHeaderCell}>Hora salida</Text>
            </View>
            {data.labor.map((l, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={styles.tableCell}>{l.technicianName}</Text>
                <Text style={styles.tableCellMono}>{l.entryTime}</Text>
                <Text style={styles.tableCellMono}>{l.exitTime}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiales</Text>
          {data.materials.length === 0 ? (
            <Text style={styles.empty}>Sin materiales</Text>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader} fixed>
                <Text style={styles.tableHeaderCell}>Unidades</Text>
                <Text style={styles.tableHeaderCell}>Descripcion</Text>
                <Text style={styles.tableHeaderCell}>Proyecto</Text>
                <Text style={styles.tableHeaderCell}>Suministro</Text>
              </View>
              {data.materials.map((m, i) => (
                <View key={i} style={styles.tableRow} wrap={false}>
                  <Text style={styles.tableCellMono}>{String(m.units)}</Text>
                  <Text style={styles.tableCell}>{m.description}</Text>
                  <Text style={styles.tableCell}>{m.project || '—'}</Text>
                  <Text style={styles.tableCell}>{m.supply || '—'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  )

  return pdf(doc).toBlob()
}

export function buildPdfFilename(client: string, createdAt: string): string {
  const sanitized = client
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
  const date = formatDate(createdAt).replace(/\//g, '-')
  return `parte-${sanitized}-${date}.pdf`
}
