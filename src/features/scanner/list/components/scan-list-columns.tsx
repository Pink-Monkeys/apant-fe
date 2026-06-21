import type { Column, ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Ellipsis, Eye } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { cn, shortId } from '#/lib/utils'
import type { Scan } from '#/features/scanner/list/types'

// Helper to format sortable header buttons
function renderSortableHeader(column: Column<Scan>, label: string) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 gap-1 px-2 text-xs font-semibold"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  )
}

export const statusStyles = {
  completed: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  running: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 animate-pulse',
  failed: 'bg-destructive/10 text-destructive dark:text-red-400 border-destructive/20',
  pending: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
} as const

export type ScanColumnCallbacks = {
  onViewDetail: (scan: Scan) => void
}

export const getScanColumns = (callbacks: ScanColumnCallbacks): ColumnDef<Scan>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => renderSortableHeader(column, 'ID'),
    cell: ({ row }) => {
      const id = row.original.id
      return (
        <span className="text-muted-foreground font-mono text-xs font-bold" title={id}>
          {shortId('SCN', id)}
        </span>
      )
    },
  },
  {
    accessorKey: 'target',
    header: ({ column }) => renderSortableHeader(column, 'Target'),
    cell: ({ row }) => {
      const scan = row.original
      return (
        <span
          className="text-foreground hover:text-primary block max-w-[250px] cursor-pointer truncate font-mono text-xs font-medium hover:underline"
          title={scan.target}
          onClick={() => callbacks.onViewDetail(scan)}
        >
          {scan.target}
        </span>
      )
    },
  },
  {
    accessorKey: 'provider',
    header: ({ column }) => renderSortableHeader(column, 'Provider'),
    cell: ({ row }) => {
      const provider = row.original.provider
      return (
        <span className="text-xs font-medium">
          {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </span>
      )
    },
  },
  {
    accessorKey: 'model',
    header: ({ column }) => renderSortableHeader(column, 'Model'),
    cell: ({ row }) => {
      return <span className="font-mono text-xs">{row.original.model}</span>
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => renderSortableHeader(column, 'Status'),
    cell: ({ row }) => {
      const status = row.original.status
      const style = statusStyles[status] || 'bg-gray-500/10 text-gray-500'
      const label = status.charAt(0).toUpperCase() + status.slice(1)

      return (
        <Badge
          variant="default"
          className={cn('border border-transparent text-[10px] font-semibold', style)}
        >
          {label}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'total_steps',
    header: ({ column }) => renderSortableHeader(column, 'Steps'),
    cell: ({ row }) => {
      return <span className="font-mono text-xs">{row.original.total_steps}</span>
    },
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => renderSortableHeader(column, 'Duration'),
    cell: ({ row }) => {
      return <span className="text-xs">{row.original.duration}</span>
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => renderSortableHeader(column, 'Created At'),
    cell: ({ row }) => {
      const dateStr = row.original.created_at
      return (
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {new Date(dateStr).toLocaleString()}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => {
      const scan = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-7 w-7"
              aria-label={`Open actions for scan ${scan.id}`}
            >
              <Ellipsis className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="gap-2 text-xs"
              onClick={() => callbacks.onViewDetail(scan)}
            >
              <Eye className="text-muted-foreground size-3.5" />
              View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
