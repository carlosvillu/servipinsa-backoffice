import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { DetailField } from '~/components/DetailField'

type WorkOrderDetailData = {
  createdAt: string
  client: string
  address: string
  carNumber: string | null
  driverOut: string | null
  driverReturn: string | null
  creatorName: string
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E0E0E0]">
                  <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                    Descripcion
                  </th>
                  <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                    Hora inicio
                  </th>
                  <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                    Hora fin
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.tasks.map((task, i) => (
                  <tr key={i} className="border-b border-[#E0E0E0] last:border-0">
                    <td className="py-2 text-[#383838]">{task.description}</td>
                    <td className="py-2 font-mono text-[#383838]">
                      {task.startTime}
                    </td>
                    <td className="py-2 font-mono text-[#383838]">
                      {task.endTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-mono text-xl uppercase">
            Mano de Obra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#E0E0E0]">
                  <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                    Tecnico
                  </th>
                  <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                    Hora entrada
                  </th>
                  <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                    Hora salida
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.labor.map((entry, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#E0E0E0] last:border-0"
                  >
                    <td className="py-2 text-[#383838]">
                      {entry.technicianName}
                    </td>
                    <td className="py-2 font-mono text-[#383838]">
                      {entry.entryTime}
                    </td>
                    <td className="py-2 font-mono text-[#383838]">
                      {entry.exitTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E0E0E0]">
                    <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                      Unidades
                    </th>
                    <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                      Descripcion
                    </th>
                    <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                      Proyecto
                    </th>
                    <th className="font-mono text-xs uppercase text-[#757575] tracking-wider pb-2">
                      Suministro
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.materials.map((material, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#E0E0E0] last:border-0"
                    >
                      <td className="py-2 font-mono text-[#383838]">
                        {material.units}
                      </td>
                      <td className="py-2 text-[#383838]">
                        {material.description}
                      </td>
                      <td className="py-2 text-[#383838]">
                        {material.project || '—'}
                      </td>
                      <td className="py-2 text-[#383838]">
                        {material.supply || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
