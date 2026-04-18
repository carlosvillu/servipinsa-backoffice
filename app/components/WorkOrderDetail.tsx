import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { DetailField } from '~/components/DetailField'
import { DetailTable } from '~/components/DetailTable'
import { formatDate } from '~/lib/dates'
import { WORK_TYPE_LABELS, type WorkType } from '~/schemas/workOrder'

type WorkOrderDetailData = {
  createdAt: string
  client: string
  address: string
  carNumber: string | null
  driverOut: string | null
  driverReturn: string | null
  creatorName: string
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

export function WorkOrderDetail({ data }: { data: WorkOrderDetailData }) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xl uppercase">
            Datos Generales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailField label="Cliente" value={data.client} />
            <DetailField label="Direccion" value={data.address} />
            <DetailField label="Numero de coche" value={data.carNumber} />
            <DetailField label="Conductor salida" value={data.driverOut} />
            <DetailField label="Conductor retorno" value={data.driverReturn} />
            <DetailField label="Creado por" value={data.creatorName} />
            <DetailField label="Fecha" value={formatDate(data.createdAt)} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xl uppercase">
            Trabajos Realizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DetailTable
            columns={[
              { header: 'Descripcion', render: (t) => t.description },
              {
                header: 'Numero de proyecto',
                render: (t) => t.projectNumber || '—',
                mono: true,
              },
              {
                header: 'Tipo de trabajo',
                render: (t) => (t.workType ? WORK_TYPE_LABELS[t.workType] : '—'),
              },
              { header: 'Hora inicio', render: (t) => t.startTime, mono: true },
              { header: 'Hora fin', render: (t) => t.endTime, mono: true },
            ]}
            rows={data.tasks}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xl uppercase">
            Mano de Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DetailTable
            columns={[
              { header: 'Tecnico', render: (e) => e.technicianName },
              { header: 'Hora entrada', render: (e) => e.entryTime, mono: true },
              { header: 'Hora salida', render: (e) => e.exitTime, mono: true },
            ]}
            rows={data.labor}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xl uppercase">
            Materiales
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.materials.length === 0 ? (
            <p className="text-[#757575] font-mono text-sm">Sin materiales</p>
          ) : (
            <DetailTable
              columns={[
                { header: 'Unidades', render: (m) => m.units, mono: true },
                { header: 'Descripcion', render: (m) => m.description },
                { header: 'Proyecto', render: (m) => m.project || '—' },
                { header: 'Suministro', render: (m) => m.supply || '—' },
              ]}
              rows={data.materials}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
