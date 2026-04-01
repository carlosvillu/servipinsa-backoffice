import { Link } from 'react-router'
import { Download } from 'lucide-react'
import { StatusBadge } from '~/components/StatusBadge'
import { Button } from '~/components/ui/button'
import { useExportWorkOrderById } from '~/hooks/useExportWorkOrder'
import { formatDate } from '~/lib/dates'
import type { WorkOrderListItemData } from '~/components/WorkOrderList'

export function WorkOrderListCard({ item }: { item: WorkOrderListItemData }) {
  const { exportById, isExporting } = useExportWorkOrderById(item.id)

  return (
    <div className="relative border border-[#383838] bg-white hover:bg-[#E0E0E0] transition-colors">
      <Link
        to={`/work-orders/${item.id}`}
        className="block p-4"
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
      <div className="absolute top-2 right-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            exportById()
          }}
          disabled={isExporting}
          aria-label="Exportar a Excel"
        >
          <Download size={16} />
        </Button>
      </div>
    </div>
  )
}
