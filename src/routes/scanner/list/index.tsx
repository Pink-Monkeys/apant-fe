import { ProtectedLayout } from '#/components/protected-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { SidebarTrigger } from '#/components/ui/sidebar'
import ScanListTable from '#/features/scanner/list/components/scan-list-table'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/scanner/list/')({
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
