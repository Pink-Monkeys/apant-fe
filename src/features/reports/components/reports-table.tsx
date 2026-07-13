import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SortingState } from '@tanstack/react-table'
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'

import {
  getReports,
  getReportDetail,
  getReportTargets,
  deleteReport,
  reportsQueryKeys,
} from '#/features/reports/api/reports-api'
import { getReportColumns } from '#/features/reports/components/report-columns'
import { downloadReportPdf } from '#/features/reports/lib/download-report-pdf'
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
import { ReportStatsCards } from '#/features/reports/components/report-stats-cards'
import { ReportsCharts } from '#/features/reports/components/reports-charts'
import { ReportsSummary } from '#/features/reports/components/reports-summary'
import type { Report } from '#/features/reports/types'
import { useIsAdmin } from '#/features/auth/hooks/use-is-admin'
import { shortId } from '#/lib/utils'
import type { TimeRangeValue } from '#/types/time-filter'
import {
  readReportsPageSize,
  writeReportsPageSize,
} from '#/features/reports/lib/page-size-preference'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ReportsTable() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAdmin = useIsAdmin()
  const search = useSearch({ from: '/reports/' })
  const [sorting, setSorting] = useState<SortingState>([])
  const [searchQuery, setSearchQuery] = useState('')
  // Remembered "rows per page" — the fallback when the URL has no explicit limit.
  const [storedPageSize] = useState(readReportsPageSize)

  const page = search.page ?? 1
  const limit = search.limit ?? storedPageSize
  const filter = { range: search.range, from: search.from, to: search.to }
  const target = search.target

  // All-time overview for the stats cards/charts/summary — independent of the
  // table's filters and page so those numbers don't shift under the user while
  // they explore the filtered table below.
  const allTimeReportsQuery = useQuery({
    queryKey: ['reports', 'all-time-summary'] as const,
    queryFn: () => getReports({ limit: 0 }),
  })
  const allTimeReports = allTimeReportsQuery.data?.reports ?? []

  // Paginated, filtered table data.
  const {
    data: reportsPage,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: reportsQueryKeys.list({ ...filter, target, page, limit }),
    queryFn: () => getReports({ ...filter, target, page, limit }),
  })
  const reports = reportsPage?.reports ?? []
  const total = reportsPage?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / limit))

  const targetsQuery = useQuery({
    queryKey: reportsQueryKeys.targets,
    queryFn: getReportTargets,
  })
  const targets = targetsQuery.data ?? []

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsQueryKeys.all })
      toast.success('Report deleted successfully')
    },
    onError: (err) => {
      toast.error(`Failed to delete report: ${err.message}`)
    },
  })

  // Download PDF helper. The list row is a summary, so fetch the full report
  // detail first (cached under the same key as the detail page) to produce an
  // identical PDF via the shared generator.
  const handleDownloadPdf = async (report: Report) => {
    try {
      const fullReport = await queryClient.fetchQuery({
        queryKey: reportsQueryKeys.detail(report.id),
        queryFn: () => getReportDetail(report.id),
      })
      await downloadReportPdf(fullReport)
    } catch (err) {
      console.error('Failed to generate report PDF', err)
      toast.error('Failed to generate PDF. Please try again.')
    }
  }

  // Compare helper
  const handleCompare = (report: Report) => {
    toast.info(`Selected ${shortId('RPT', report.id)} for comparison. Feature is being integrated!`)
  }

  // View Detail helper
  const handleViewDetail = (report: Report) => {
    navigate({ to: '/reports/$reportId', params: { reportId: report.id } })
  }

  // Delete helper
  const handleDelete = (report: Report) => {
    if (confirm(`Are you sure you want to delete report ${shortId('RPT', report.id)}?`)) {
      deleteMutation.mutate(report.id)
    }
  }

  // Search box is client-side over the currently fetched page only — a known
  // limitation of server-side pagination.
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports
    const query = searchQuery.toLowerCase()
    return reports.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.metadata.target.toLowerCase().includes(query) ||
        r.overall_severity.toLowerCase().includes(query) ||
        (r.vulnerabilities &&
          r.vulnerabilities.some(
            (v) => v.title.toLowerCase().includes(query) || v.type.toLowerCase().includes(query)
          ))
    )
  }, [reports, searchQuery])

  // Set up columns with callbacks. The Pentester column is admin-only.
  const columns = useMemo(
    () =>
      getReportColumns(
        {
          onViewDetail: handleViewDetail,
          onDownloadPdf: handleDownloadPdf,
          onDelete: handleDelete,
          onCompare: handleCompare,
        },
        { isAdmin }
      ),
    [isAdmin]
  )

  const table = useReactTable({
    data: filteredReports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize: limit }) : updater
      // Remember the page size so it survives a bare navigation back to /reports.
      if (next.pageSize !== limit) {
        writeReportsPageSize(next.pageSize)
      }
      navigate({
        to: '/reports',
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
      to: '/reports',
      search: (prev) => ({
        ...prev,
        range: value === 'all' ? undefined : value,
        from: undefined,
        to: undefined,
        page: 1,
      }),
    })
  }

  const handleTargetChange = (value: string) => {
    navigate({
      to: '/reports',
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
        <span className="font-semibold">Error Loading Reports</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
          All-Time Overview
        </p>
        <div className="space-y-6">
          <ReportStatsCards reports={allTimeReports} />
          <ReportsCharts reports={allTimeReports} />
          <ReportsSummary reports={allTimeReports} />
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-primary border">
        <CardHeader className="flex flex-col gap-4">
          <div>
            <CardTitle>Penetration Test Reports</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              List of all penetration testing reports generated by the AI agent.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <TimeRangeFilter value={search.range ?? 'all'} onChange={handleTimeRangeChange} />
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
                placeholder="Search reports or targets..."
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
              <span className="text-muted-foreground text-sm">Loading reports data...</span>
            </div>
          ) : (
            <>
              <DataTable table={table} emptyMessage="No reports found matching your criteria." />
              <DataTablePagination table={table} totalRowsOverride={total} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
