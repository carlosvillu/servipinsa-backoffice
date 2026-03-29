import { Link } from 'react-router'
import { StatusBadge } from '~/components/StatusBadge'
import { formatDate } from '~/lib/dates'

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
                <td className="px-4 py-3 font-sans text-sm text-[#383838]">
                  <Link to={`/work-orders/${item.id}`}>{formatDate(item.createdAt)}</Link>
                </td>
                <td className="px-4 py-3 font-mono uppercase text-sm text-[#383838]">
                  <Link to={`/work-orders/${item.id}`}>{item.client}</Link>
                </td>
                <td className="px-4 py-3 font-sans text-sm text-[#757575]">
                  <Link to={`/work-orders/${item.id}`}>{item.address}</Link>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-[#383838] text-center">
                  <Link to={`/work-orders/${item.id}`}>{item.validationCount}</Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link to={`/work-orders/${item.id}`}>
                    <StatusBadge validationCount={item.validationCount} />
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
