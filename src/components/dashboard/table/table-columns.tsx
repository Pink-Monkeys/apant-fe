import type { Column, ColumnDef, Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { ArrowUpDown, Ellipsis } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'
import { severityStyles } from '#/lib/severity'

type SessionHistoryRow = {
  scanId: string
  reportId: string
  detail: string
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational' | '-'
}

function renderSortableHeader(column: Column<SessionHistoryRow>, label: string) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 gap-1 px-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  )
}

const sessionHistoryColumns: ColumnDef<SessionHistoryRow>[] = [
  {
    accessorKey: 'reportId',
    header: ({ column }) => renderSortableHeader(column, 'ID Scan'),
  },
  {
    accessorKey: 'detail',
    header: ({ column }) => renderSortableHeader(column, 'Detail'),
    cell: ({ getValue }) => <span className="block max-w-130 truncate">{String(getValue())}</span>,
  },
  {
    accessorKey: 'severity',
    header: ({ column }) => renderSortableHeader(column, 'Severity'),
    cell: ({ getValue }) => {
      const value = getValue() as SessionHistoryRow['severity']
      const severityClass =
        severityStyles[value as keyof typeof severityStyles]?.badge ??
        'bg-secondary text-secondary-foreground'

      return (
        <Badge variant="default" className={cn('border-transparent', severityClass)}>
          {value}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => <SessionActionsCell row={row} />,
  },
]

function SessionActionsCell({ row }: { row: Row<SessionHistoryRow> }) {
  const navigate = useNavigate()
  const { scanId, reportId } = row.original

  const handleViewDetails = () => {
    navigate({ to: '/scanner/list/$scanId', params: { scanId } })
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(reportId)
      toast.success(`Copied ${reportId}`)
    } catch {
      toast.error('Failed to copy ID')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-7 w-7"
          aria-label={`Open actions for ${reportId}`}
        >
          <Ellipsis className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleViewDetails}>View details</DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyId}>Copy report ID</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type { SessionHistoryRow }
export { sessionHistoryColumns }
