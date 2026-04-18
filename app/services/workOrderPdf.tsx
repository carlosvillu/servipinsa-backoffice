import { formatDate } from '~/lib/dates'
import { WORK_TYPE_LABELS } from '~/schemas/workOrder'
import {
  buildExportFilename,
  type WorkOrderExportData,
} from '~/services/workOrderExport'

export type { WorkOrderExportData }

const COLORS = {
  ink: '#383838',
  paper: '#F4EFEA',
  slate: '#757575',
  border: '#D9D4CF',
  text: '#1A1A1A',
}

type PdfModule = typeof import('@react-pdf/renderer')

let pdfModulePromise: Promise<PdfModule> | null = null

async function loadPdfModule(): Promise<PdfModule> {
  if (!pdfModulePromise) {
    pdfModulePromise = import('@react-pdf/renderer')
  }
  return pdfModulePromise
}

function createStyles(mod: PdfModule) {
  return mod.StyleSheet.create({
    page: {
      paddingTop: 28,
      paddingBottom: 32,
      paddingHorizontal: 32,
      fontFamily: 'Helvetica',
      fontSize: 9,
      color: COLORS.text,
    },
    section: { marginBottom: 16 },
    sectionTitle: {
      fontFamily: 'Courier',
      fontSize: 13,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      backgroundColor: COLORS.ink,
      color: COLORS.paper,
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginBottom: 6,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    gridCell: { width: '50%', paddingVertical: 4, paddingHorizontal: 6 },
    label: {
      fontSize: 7,
      textTransform: 'uppercase',
      color: COLORS.slate,
      marginBottom: 2,
    },
    value: { fontSize: 10 },
    table: {
      borderWidth: 1,
      borderColor: COLORS.border,
      borderStyle: 'solid',
    },
    tableHeader: { flexDirection: 'row', backgroundColor: COLORS.ink },
    tableHeaderCell: {
      flex: 1,
      padding: 6,
      color: COLORS.paper,
      fontSize: 8,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      borderTopStyle: 'solid',
    },
    tableCell: { flex: 1, padding: 6, fontSize: 9 },
    tableCellMono: { flex: 1, padding: 6, fontSize: 9, fontFamily: 'Courier' },
    empty: {
      fontFamily: 'Courier',
      fontSize: 9,
      color: COLORS.slate,
      padding: 6,
    },
  })
}

type Styles = ReturnType<typeof createStyles>

let cachedStyles: Styles | null = null

function getStyles(mod: PdfModule): Styles {
  if (!cachedStyles) cachedStyles = createStyles(mod)
  return cachedStyles
}

function Field({
  mod,
  styles,
  label,
  value,
}: {
  mod: PdfModule
  styles: Styles
  label: string
  value: string | null
}) {
  const { Text, View } = mod
  return (
    <View style={styles.gridCell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  )
}

export async function generateWorkOrderPdf(
  data: WorkOrderExportData,
): Promise<Blob> {
  const mod = await loadPdfModule()
  const { Document, Page, Text, View, pdf } = mod
  const styles = getStyles(mod)

  const doc = (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Generales</Text>
          <View style={styles.grid}>
            <Field mod={mod} styles={styles} label="Cliente" value={data.client} />
            <Field mod={mod} styles={styles} label="Direccion" value={data.address} />
            <Field mod={mod} styles={styles} label="Numero de coche" value={data.carNumber} />
            <Field mod={mod} styles={styles} label="Conductor salida" value={data.driverOut} />
            <Field mod={mod} styles={styles} label="Conductor retorno" value={data.driverReturn} />
            <Field mod={mod} styles={styles} label="Creado por" value={data.creatorName} />
            <Field mod={mod} styles={styles} label="Fecha" value={formatDate(data.createdAt)} />
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

export function buildPdfFilename(
  data: Pick<WorkOrderExportData, 'client' | 'createdAt'>,
): string {
  return buildExportFilename(data, 'pdf')
}
