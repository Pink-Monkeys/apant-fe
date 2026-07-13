import { z } from 'zod'
import { ProtectedLayout } from '#/components/protected-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { ReportsTable } from '#/features/reports/components/reports-table'
import { requireAuth } from '#/features/auth/guard'
import { timeRangeSearchSchema } from '#/types/time-filter'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

const reportsSearchSchema = timeRangeSearchSchema.extend({
  target: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export const Route = createFileRoute('/reports/')({
  beforeLoad: () => requireAuth(),
  validateSearch: reportsSearchSchema,
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
                <BreadcrumbPage>Reports</BreadcrumbPage>
              </BreadcrumbItem>
              <ChevronRight className="size-4" />
              <BreadcrumbItem>
                <BreadcrumbPage>List Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </>
      }
    >
      <main className="space-y-4">
        <ReportsTable />
      </main>
    </ProtectedLayout>
  )
}
