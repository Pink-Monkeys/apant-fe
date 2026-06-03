import { ProtectedLayout } from '#/components/protected-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'

export const Route = createFileRoute('/scanner/static/')({
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
                <BreadcrumbPage>Static</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </>
      }
    >
      <div>Scanner Static Page</div>
    </ProtectedLayout>
  )
}
