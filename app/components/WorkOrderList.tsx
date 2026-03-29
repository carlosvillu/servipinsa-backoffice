import { Link } from 'react-router'
import { StatusBadge } from '~/components/StatusBadge'

export type WorkOrderListItemData = {
  id: string
  createdAt: string
  client: string
  address: string
  validationCount: number
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

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
      {/* Desktop table */}
      <div className="hidden md:block border border-[#383838] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#383838] text-[#F4EFEA]">
              <th className="font-mono uppercase tracking-wider text-xs text-left px-4 py-3">
                Fecha
              </th>
              <th className="font-mono uppercase tracking-wider text-xs text-left px-4 py-3">
                Cliente
              </th>
              <th className="font-mono uppercase tracking-wider text-xs text-left px-4 py-3">
                Dirección
              </th>
              <th className="font-mono uppercase tracking-wider text-xs text-center px-4 py-3">
                Validaciones
              </th>
              <th className="font-mono uppercase tracking-wider text-xs text-center px-4 py-3">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-[#E0E0E0] bg-white hover:bg-[#E0E0E0] transition-colors">
                <td className="px-4 py-3">
                  <Link
                    to={`/work-orders/${item.id}`}
                    className="block font-sans text-sm text-[#383838]"
                  >
                    {formatDate(item.createdAt)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/work-orders/${item.id}`}
                    className="block font-mono uppercase text-sm text-[#383838]"
                  >
                    {item.client}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/work-orders/${item.id}`}
                    className="block font-sans text-sm text-[#757575]"
                  >
                    {item.address}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link
                    to={`/work-orders/${item.id}`}
                    className="block font-mono text-sm text-[#383838]"
                  >
                    {item.validationCount}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link to={`/work-orders/${item.id}`} className="block">
                    <StatusBadge validationCount={item.validationCount} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
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
