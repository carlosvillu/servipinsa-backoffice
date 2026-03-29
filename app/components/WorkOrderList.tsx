import { Link } from 'react-router'
import { StatusBadge } from '~/components/StatusBadge'

export type WorkOrderListItemData = {
  id: string
  createdAt: string
  client: string
  address: string
  validationCount: number
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

const thClass = 'font-mono uppercase tracking-wider text-xs px-4 py-3'

export function WorkOrderList({
  items,
}: {
  items: WorkOrderListItemData[]
}) {
  if (items.length === 0) {
    return (
      <div className="border border-[#383838] bg-white p-8 text-center">
        <p className="font-mono text-[#757575] uppercase tracking-wider text-sm">
          No hay partes de trabajo.
        </p>
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
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[#E0E0E0] bg-white hover:bg-[#E0E0E0] transition-colors">
                <td colSpan={5} className="p-0">
                  <Link
                    to={`/work-orders/${item.id}`}
                    className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center"
                  >
                    <span className="px-4 py-3 font-sans text-sm text-[#383838]">
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="px-4 py-3 font-mono uppercase text-sm text-[#383838]">
                      {item.client}
                    </span>
                    <span className="px-4 py-3 font-sans text-sm text-[#757575]">
                      {item.address}
                    </span>
                    <span className="px-4 py-3 font-mono text-sm text-[#383838] text-center">
                      {item.validationCount}
                    </span>
                    <span className="px-4 py-3 text-center">
                      <StatusBadge validationCount={item.validationCount} />
                    </span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/work-orders/${item.id}`}
            className="block border border-[#383838] bg-white p-4 hover:bg-[#E0E0E0] transition-colors"
          >
            <p className="font-mono uppercase text-sm text-[#383838]">
              {item.client}
            </p>
            <p className="font-sans text-sm text-[#757575] mt-1">
              {item.address}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-sans text-xs text-[#757575]">
                {formatDate(item.createdAt)}
              </span>
              <StatusBadge validationCount={item.validationCount} />
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
