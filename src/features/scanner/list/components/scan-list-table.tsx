import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Search, Loader2 } from 'lucide-react'

import { getScans, scanListQueryKeys } from '#/features/scanner/list/api/scan-list-api'
import { getScanColumns } from '#/features/scanner/list/components/scan-list-columns'
import type { Scan } from '#/features/scanner/list/types'
import { DataTable } from '#/components/ui/data-table'
import { DataTablePagination } from '#/components/ui/data-table-pagination'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'

export default function ScanListTable() {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch scans
  const {
    data: scans = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: scanListQueryKeys.all,
    queryFn: getScans,
  })

  // Navigate to the scan detail page
  const handleViewDetail = (scan: Scan) => {
    navigate({ to: '/scanner/list/$scanId', params: { scanId: scan.id } })
  }

  // Filter scans
  const filteredScans = useMemo(() => {
    if (!searchQuery.trim()) return scans
    const query = searchQuery.toLowerCase()
    return scans.filter(
      (s) =>
        s.target.toLowerCase().includes(query) ||
        s.provider.toLowerCase().includes(query) ||
        s.model.toLowerCase().includes(query) ||
        s.status.toLowerCase().includes(query) ||
        `scn-${s.id.substring(s.id.length - 4)}`.toLowerCase().includes(query)
    )
  }, [scans, searchQuery])

  // Setup columns
  const columns = useMemo(
    () =>
      getScanColumns({
        onViewDetail: handleViewDetail,
      }),
    []
  )

  const table = useReactTable({
    data: filteredScans,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { sorting, pagination },
  })

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader2 className="text-primary size-8 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading scans data...</span>
      </div>
    )
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
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Historical Scans</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              List of all security scanning tasks run by the AI agent.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground absolute top-2 left-2.5 size-4" />
            <Input
              placeholder="Search target, provider, or model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/20 pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <DataTable table={table} emptyMessage="No scans found matching your criteria." />
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
    </div>
  )
}
