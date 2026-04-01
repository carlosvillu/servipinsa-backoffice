import { Link } from 'react-router'
import { Download } from 'lucide-react'
import { StatusBadge } from '~/components/StatusBadge'
import { Button } from '~/components/ui/button'
import { useExportWorkOrderById } from '~/hooks/useExportWorkOrder'
import { formatDate } from '~/lib/dates'
import type { WorkOrderListItemData } from '~/components/WorkOrderList'

export function WorkOrderListRow({ item }: { item: WorkOrderListItemData }) {
  const { exportById, isExporting } = useExportWorkOrderById(item.id)

  return (
    <tr className="border-t border-[#E0E0E0] bg-white hover:bg-[#E0E0E0] transition-colors">
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
      <td className="px-4 py-3 text-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={exportById}
          disabled={isExporting}
          aria-label="Exportar a Excel"
        >
          <Download size={16} />
        </Button>
      </td>
    </tr>
  )
}
