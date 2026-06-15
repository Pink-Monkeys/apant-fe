import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { getReports, deleteReport, reportsQueryKeys } from '#/features/reports/api/reports-api'
import { getReportColumns } from '#/features/reports/components/report-columns'
import { DataTable } from '#/components/ui/data-table'
import { DataTablePagination } from '#/components/ui/data-table-pagination'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { ReportStatsCards } from '#/features/reports/components/report-stats-cards'
import { ReportsCharts } from '#/features/reports/components/reports-charts'
import { ReportsSummary } from '#/features/reports/components/reports-summary'
import type { Report } from '#/features/reports/types'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function ReportsTable() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch Reports list
  const {
    data: reports = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: reportsQueryKeys.all,
    queryFn: getReports,
  })

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

  // Export JSON helper
  const handleExport = (report: Report) => {
    try {
      const dataStr = JSON.stringify(report, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

      const exportFileDefaultName = `report-${report.id.substring(0, 8)}.json`

      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      toast.success(`Exported report ${report.id.substring(0, 8)} successfully`)
    } catch {
      toast.error('Failed to export report')
    }
  }

  // Compare helper
  const handleCompare = (report: Report) => {
    const shortId = `RPT-${report.id.substring(report.id.length - 4).toUpperCase()}`
    toast.info(`Selected ${shortId} for comparison. Feature is being integrated!`)
  }

  // View Detail helper
  const handleViewDetail = (report: Report) => {
    navigate({ to: '/reports/$reportId', params: { reportId: report.id } })
  }

  // Delete helper
  const handleDelete = (report: Report) => {
    const shortId = `RPT-${report.id.substring(report.id.length - 4).toUpperCase()}`
    if (confirm(`Are you sure you want to delete report ${shortId}?`)) {
      deleteMutation.mutate(report.id)
    }
  }

  // Filter reports by search query
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

  // Set up columns with callbacks
  const columns = useMemo(
    () =>
      getReportColumns({
        onViewDetail: handleViewDetail,
        onExport: handleExport,
        onDelete: handleDelete,
        onCompare: handleCompare,
      }),
    []
  )

  const table = useReactTable({
    data: filteredReports,
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
        <span className="text-muted-foreground text-sm">Loading reports data...</span>
      </div>
    )
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
      {/* 4 Cards Stats */}
      <ReportStatsCards reports={reports} />

      {/* Charts Section */}
      <ReportsCharts reports={reports} />

      {/* Executive Summary */}
      <ReportsSummary reports={reports} />

      {/* Main Table Card */}
      <Card className="border-primary border">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Penetration Test Reports</CardTitle>
            <p className="text-muted-foreground mt-1 text-xs">
              List of all penetration testing reports generated by the AI agent.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="text-muted-foreground absolute top-2 left-2.5 size-4" />
            <Input
              placeholder="Search reports or targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/20 pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <DataTable table={table} emptyMessage="No reports found matching your criteria." />
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
    </div>
  )
}
