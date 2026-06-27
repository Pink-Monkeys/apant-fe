import { ProtectedLayout } from '#/components/protected-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { requireAuth } from '#/features/auth/guard'
import { RemediationView } from '#/features/recommendations/components/remediation-view'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/recommendations/')({
  beforeLoad: () => requireAuth(),
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
                <BreadcrumbPage>Recommendations</BreadcrumbPage>
              </BreadcrumbItem>
              <ChevronRight className="size-4" />
              <BreadcrumbItem>
                <BreadcrumbPage>Remediation</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </>
      }
    >
      <main className="space-y-4">
        <RemediationView />
      </main>
    </ProtectedLayout>
  )
}
