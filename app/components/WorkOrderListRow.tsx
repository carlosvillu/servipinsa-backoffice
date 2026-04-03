import { Link } from 'react-router'
import { Download } from 'lucide-react'
import { StatusBadge } from '~/components/StatusBadge'
import { Button } from '~/components/ui/button'
import { formatDate } from '~/lib/dates'
import type { WorkOrderListItemData } from '~/components/WorkOrderList'

export function WorkOrderListRow({
  item,
  onExport,
  isExporting,
}: {
  item: WorkOrderListItemData
  onExport: (id: string) => void
  isExporting: boolean
}) {
  const linkTo = `/work-orders/${item.id}`

  return (
    <tr className="border-t border-[#E0E0E0] bg-white hover:bg-[#E0E0E0] transition-colors">
      <td className="font-sans text-sm text-[#383838]">
        <Link to={linkTo} className="block px-4 py-3">{formatDate(item.createdAt)}</Link>
      </td>
      <td className="font-mono uppercase text-sm text-[#383838]">
        <Link to={linkTo} className="block px-4 py-3">{item.client}</Link>
      </td>
      <td className="font-sans text-sm text-[#757575]">
        <Link to={linkTo} className="block px-4 py-3">{item.address}</Link>
      </td>
      <td className="font-mono text-sm text-[#383838] text-center">
        <Link to={linkTo} className="block px-4 py-3">{item.validationCount}</Link>
      </td>
      <td className="text-center">
        <Link to={linkTo} className="block px-4 py-3">
          <StatusBadge validationCount={item.validationCount} />
        </Link>
      </td>
      <td className="px-4 py-3 text-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onExport(item.id)}
          disabled={isExporting}
          aria-label="Exportar a Excel"
        >
          <Download size={16} />
        </Button>
      </td>
    </tr>
  )
}
