import { ProtectedLayout } from '#/components/protected-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { requireRole } from '#/features/auth/guard'
import { ProviderManager } from '#/features/llm/components/provider-manager'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/llm/manage/')({
  beforeLoad: () => requireRole('admin'),
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
                <BreadcrumbPage>LLM</BreadcrumbPage>
              </BreadcrumbItem>
              <ChevronRight className="size-4" />
              <BreadcrumbItem>
                <BreadcrumbPage>Manajemen</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </>
      }
    >
      <ProviderManager />
    </ProtectedLayout>
  )
}
