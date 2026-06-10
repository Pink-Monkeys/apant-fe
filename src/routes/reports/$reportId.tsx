import { createFileRoute, Link } from '@tanstack/react-router'
import { ProtectedLayout } from '#/components/protected-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { requireAuth } from '#/features/auth/guard'
import { ReportDetail } from '#/features/reports/components/report-detail'

export const Route = createFileRoute('/reports/$reportId')({
  beforeLoad: () => requireAuth(),
  component: RouteComponent,
})

function RouteComponent() {
  const { reportId } = Route.useParams()

  return (
    <ProtectedLayout
      header={
        <>
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/reports">Reports</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Detail</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </>
      }
    >
      <main className="space-y-4">
        <ReportDetail reportId={reportId} />
      </main>
    </ProtectedLayout>
  )
}
