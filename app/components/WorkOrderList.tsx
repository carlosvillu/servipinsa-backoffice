import { Link } from 'react-router'
import { ClipboardList } from 'lucide-react'
import { WorkOrderListRow } from '~/components/WorkOrderListRow'
import { WorkOrderListCard } from '~/components/WorkOrderListCard'
import { useExportWorkOrderById } from '~/hooks/useExportWorkOrder'

export type WorkOrderListItemData = {
  id: string
  createdAt: string
  client: string
  address: string
  validationCount: number
}

const thClass = 'font-mono uppercase tracking-wider text-xs px-4 py-3'

export function WorkOrderList({
  items,
}: {
  items: WorkOrderListItemData[]
}) {
  const { exportById, isExporting, exportingId } = useExportWorkOrderById()

  if (items.length === 0) {
    return (
      <div className="border border-[#383838] bg-white p-12 text-center flex flex-col items-center gap-4">
        <ClipboardList size={48} stroke="#757575" strokeWidth={1.5} />
        <p className="font-mono text-[#383838] uppercase tracking-wider text-sm">
          No hay partes de trabajo
        </p>
        <p className="font-sans text-sm text-[#757575]">
          Crea tu primer parte de trabajo para empezar.
        </p>
        <Link
          to="/work-orders/new"
          className="mt-2 inline-block font-mono uppercase text-sm bg-[#383838] text-[#F4EFEA] px-6 py-3 border border-[#383838] hover:bg-[#2BA5FF] hover:border-[#2BA5FF] transition-all"
        >
          Crear Parte de Trabajo
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="hidden md:block border border-[#383838] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#383838] text-[#F4EFEA]">
              <th className={`${thClass} text-left`}>Fecha</th>
              <th className={`${thClass} text-left`}>Cliente</th>
              <th className={`${thClass} text-left`}>Dirección</th>
              <th className={`${thClass} text-center`}>Validaciones</th>
              <th className={`${thClass} text-center`}>Estado</th>
              <th className={`${thClass} text-center w-12`} />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <WorkOrderListRow
                key={item.id}
                item={item}
                onExport={exportById}
                isExporting={isExporting && exportingId === item.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <WorkOrderListCard
            key={item.id}
            item={item}
            onExport={exportById}
            isExporting={isExporting && exportingId === item.id}
          />
        ))}
      </div>
    </>
  )
}
