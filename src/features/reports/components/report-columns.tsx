import type { Column, ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Ellipsis,
  Eye,
  Download,
  Trash2,
  GitCompare,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'
import { severityStyles } from '#/lib/severity'
import type { Report } from '#/features/reports/types'

// Helper to format sortable header buttons
function renderSortableHeader(column: Column<Report>, label: string) {
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

// Helper to extract clean display title
function getDisplayTitle(report: Report): string {
  if (report.vulnerabilities && report.vulnerabilities.length > 0) {
    const firstVuln = report.vulnerabilities[0]
    try {
      const path = new URL(firstVuln.location).pathname
      return `${firstVuln.title} on ${path}`
    } catch {
      return firstVuln.title
    }
  }

  const parts = report.title.split(' - ')
  if (parts.length > 1) {
    return parts[parts.length - 1]
  }
  return report.title
}

// Helper to extract clean subtitle
function getDisplaySubtitle(report: Report): string {
  let domain = ''
  try {
    domain = new URL(report.metadata.target).hostname
  } catch {
    domain = report.metadata.target
  }
  const duration = report.metadata.duration || ''
  const date = report.created_at.split('T')[0]

  return `${domain} • ${duration} • ${date}`
}

export type ReportColumnCallbacks = {
  onViewDetail: (report: Report) => void
  onExport: (report: Report) => void
  onDelete: (report: Report) => void
  onCompare: (report: Report) => void
}

export const getReportColumns = (callbacks: ReportColumnCallbacks): ColumnDef<Report>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => renderSortableHeader(column, 'ID'),
    cell: ({ row }) => {
      const id = row.original.id
      const shortId = `RPT-${id.substring(id.length - 4).toUpperCase()}`
      return <span className="text-muted-foreground font-mono text-xs font-bold">{shortId}</span>
    },
  },
  {
    id: 'titleSummary',
    header: ({ column }) => renderSortableHeader(column, 'Title / Summary'),
    cell: ({ row }) => {
      const report = row.original
      const mainTitle = getDisplayTitle(report)
      const subtitle = getDisplaySubtitle(report)

      return (
        <div className="flex min-w-50 flex-col gap-0.5 py-1">
          <span
            className="text-foreground cursor-pointer text-sm leading-snug font-semibold hover:underline"
            onClick={() => callbacks.onViewDetail(report)}
          >
            {mainTitle}
          </span>
          <span className="text-muted-foreground text-xs leading-normal">{subtitle}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'metadata.target',
    header: ({ column }) => renderSortableHeader(column, 'Target'),
    cell: ({ row }) => {
      const target = row.original.metadata.target
      return (
        <span className="block max-w-37.5 truncate text-xs font-medium" title={target}>
          {target}
        </span>
      )
    },
  },
  {
    accessorKey: 'overall_severity',
    header: ({ column }) => renderSortableHeader(column, 'Severity'),
    cell: ({ row }) => {
      const sev = row.original.overall_severity
      const capitalized = (sev.charAt(0).toUpperCase() +
        sev.slice(1)) as keyof typeof severityStyles
      const style = severityStyles[capitalized] || severityStyles.Informational

      return (
        <Badge
          variant="default"
          className={cn('border-transparent text-[10px] font-semibold', style.badge)}
        >
          {capitalized}
        </Badge>
      )
    },
  },
  {
    id: 'findings',
    header: ({ column }) => renderSortableHeader(column, 'Findings'),
    cell: ({ row }) => {
      const count = row.original.statistics.total_vulnerabilities
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold">
          {count > 0 ? (
            <>
              <ShieldAlert className="text-destructive size-3.5" />
              <span className="text-destructive font-mono">{count}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-3.5 text-green-500" />
              <span className="font-mono text-green-500">0</span>
            </>
          )}
        </span>
      )
    },
  },
  {
    accessorKey: 'statistics.scan_status',
    header: ({ column }) => renderSortableHeader(column, 'Scan Status'),
    cell: ({ row }) => {
      const status = row.original.statistics.scan_status
      const hasFindings = row.original.statistics.total_vulnerabilities > 0

      return (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'size-2 rounded-full',
              hasFindings ? 'bg-destructive animate-pulse' : 'bg-green-500'
            )}
          />
          <span className="text-muted-foreground text-xs font-medium">{status}</span>
        </div>
      )
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
      const report = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground h-7 w-7"
              aria-label={`Open actions for report ${report.id}`}
            >
              <Ellipsis className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="gap-2 text-xs"
              onClick={() => callbacks.onViewDetail(report)}
            >
              <Eye className="text-muted-foreground size-3.5" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs" onClick={() => callbacks.onExport(report)}>
              <Download className="text-muted-foreground size-3.5" />
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs" onClick={() => callbacks.onCompare(report)}>
              <GitCompare className="text-muted-foreground size-3.5" />
              Compare
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/10 hover:text-destructive! gap-2 text-xs"
              onClick={() => callbacks.onDelete(report)}
            >
              <Trash2 className="size-3.5" />
              Delete report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
