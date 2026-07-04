import { ProtectedLayout } from '#/components/protected-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { requireAuth } from '#/features/auth/guard'
import { LlmSelector } from '#/features/llm/components/llm-selector'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/llm/select/')({
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
                <BreadcrumbPage>LLM</BreadcrumbPage>
              </BreadcrumbItem>
              <ChevronRight className="size-4" />
              <BreadcrumbItem>
                <BreadcrumbPage>Pilih</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </>
      }
    >
      <LlmSelector />
    </ProtectedLayout>
  )
}
