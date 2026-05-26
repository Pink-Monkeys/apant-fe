import { useState } from 'react'
import type { PaginationState, SortingState } from '@tanstack/react-table'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { latestSessionHistoryData } from '#/components/dashboard/table/table-data'
import { DataTable } from '#/components/ui/data-table'
import { DataTablePagination } from '#/components/ui/data-table-pagination'
import { sessionHistoryColumns } from '#/components/dashboard/table/table-columns'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

function HistorySessionTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })

  const table = useReactTable({
    data: latestSessionHistoryData,
    columns: sessionHistoryColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: { sorting, pagination },
  })

  return (
    <Card className="border-chart-1 w-full border">
      <CardHeader>
        <CardTitle>History Session Terbaru</CardTitle>
        <CardAction />
      </CardHeader>
      <CardContent className="space-y-3">
        <DataTable table={table} emptyMessage="No sessions found." />
        <DataTablePagination table={table} />
      </CardContent>
    </Card>
  )
}

export { HistorySessionTable }
