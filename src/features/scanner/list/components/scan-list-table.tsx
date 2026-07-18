import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { SortingState } from '@tanstack/react-table'
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { Search, Loader2 } from 'lucide-react'

import {
  getScans,
  getScanTargets,
  scanListQueryKeys,
} from '#/features/scanner/list/api/scan-list-api'
import { getScanColumns } from '#/features/scanner/list/components/scan-list-columns'
import type { Scan } from '#/features/scanner/list/types'
import { useIsAdmin } from '#/features/auth/hooks/use-is-admin'
import { shortId } from '#/lib/utils'
import { DataTable } from '#/components/ui/data-table'
import { DataTablePagination } from '#/components/ui/data-table-pagination'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { TimeRangeFilter } from '#/components/time-range-filter'
import type { TimeRangeValue } from '#/types/time-filter'

// Matches the backend default page size; used as the fallback when the URL has
// no explicit ?limit.
const DEFAULT_SCAN_PAGE_SIZE = 20

export default function ScanListTable() {
  const navigate = useNavigate()
  const isAdmin = useIsAdmin()
  const search = useSearch({ from: '/scanner/list/' })
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchQuery, setSearchQuery] = useState('')

  const page = search.page ?? 1
  const limit = search.limit ?? DEFAULT_SCAN_PAGE_SIZE
  const filter = { range: search.range, from: search.from, to: search.to }
  const target = search.target

  // Paginated, filtered table data (server-side).
  const {
    data: scansPage,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: scanListQueryKeys.list({ ...filter, target, page, limit }),
    queryFn: () => getScans({ ...filter, target, page, limit }),
  })
  const scans = scansPage?.scans ?? []
  const total = scansPage?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / limit))

  const targetsQuery = useQuery({
    queryKey: scanListQueryKeys.targets,
    queryFn: getScanTargets,
  })
  const targets = targetsQuery.data ?? []

  // Navigate to the scan detail page
  const handleViewDetail = (scan: Scan) => {
    navigate({ to: '/scanner/list/$scanId', params: { scanId: scan.id } })
  }

  // Search box is client-side over the currently fetched page only — a known
  // limitation of server-side pagination (mirrors the Reports table).
  const filteredScans = useMemo(() => {
    if (!searchQuery.trim()) return scans
    const query = searchQuery.toLowerCase()
    return scans.filter(
      (s) =>
        s.target.toLowerCase().includes(query) ||
        s.provider.toLowerCase().includes(query) ||
        s.model.toLowerCase().includes(query) ||
        s.status.toLowerCase().includes(query) ||
        shortId('SCN', s.id).toLowerCase().includes(query)
    )
  }, [scans, searchQuery])

  // Setup columns. The Owner column is admin-only.
  const columns = useMemo(
    () =>
      getScanColumns(
        {
          onViewDetail: handleViewDetail,
        },
        { isAdmin }
      ),
    [isAdmin]
  )

  const table = useReactTable({
    data: filteredScans,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: limit }) : updater
      navigate({
        to: '/scanner/list',
        search: (prev) => ({
          ...prev,
          page: next.pageIndex + 1,
          limit: next.pageSize,
        }),
      })
    },
    state: {
      sorting,
      pagination: { pageIndex: page - 1, pageSize: limit },
    },
  })

  const handleTimeRangeChange = (value: TimeRangeValue | 'all') => {
    navigate({
      to: '/scanner/list',
      search: (prev) => ({
        ...prev,
        range: value === 'all' ? undefined : value,
        from: undefined,
        to: undefined,
        page: 1,
      }),
    })
  }

  const handleCustomRangeChange = (from: string, to: string) => {
    navigate({
      to: '/scanner/list',
      search: (prev) => ({
        ...prev,
        range: undefined,
        from,
        to,
        page: 1,
      }),
    })
  }

  const handleTargetChange = (value: string) => {
    navigate({
      to: '/scanner/list',
      search: (prev) => ({
        ...prev,
        target: value === 'all' ? undefined : value,
        page: 1,
      }),
    })
  }

  if (isError) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex h-64 flex-col items-center justify-center gap-2 border p-4">
        <span className="font-semibold">Error Loading Scans</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary border">
        <CardHeader className="flex flex-col gap-4">
          <div>
            <CardTitle>Historical Scans</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              List of all security scanning tasks run by the AI agent.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <TimeRangeFilter
                range={search.range ?? 'all'}
                from={search.from}
                to={search.to}
                onPresetChange={handleTimeRangeChange}
                onCustomChange={handleCustomRangeChange}
              />
              <Select value={target ?? 'all'} onValueChange={handleTargetChange}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="All targets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All targets</SelectItem>
                  {targets.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Input — pushed to the far right on wide screens */}
            <div className="relative w-full min-w-72 lg:ml-auto lg:w-80 lg:shrink-0">
              <Search className="text-muted-foreground absolute top-2 left-2.5 size-4" />
              <Input
                placeholder="Search target, provider, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted/20 pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2">
              <Loader2 className="text-primary size-8 animate-spin" />
              <span className="text-muted-foreground text-sm">Loading scans data...</span>
            </div>
          ) : (
            <>
              <DataTable table={table} emptyMessage="No scans found matching your criteria." />
              <DataTablePagination table={table} totalRowsOverride={total} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
