import { z } from 'zod'
import { ProtectedLayout } from '#/components/protected-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { SidebarTrigger } from '#/components/ui/sidebar'
import ScanListTable from '#/features/scanner/list/components/scan-list-table'
import { timeRangeSearchSchema } from '#/types/time-filter'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

const scanListSearchSchema = timeRangeSearchSchema.extend({
  target: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(0).max(100).optional(),
})

export const Route = createFileRoute('/scanner/list/')({
  validateSearch: scanListSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ProtectedLayout
      header={
        <>
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Scanner</BreadcrumbPage>
              </BreadcrumbItem>
              <ChevronRight className="size-4" />
              <BreadcrumbItem>
                <BreadcrumbPage>Scan List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </>
      }
    >
      <ScanListTable />
    </ProtectedLayout>
  )
}
