import type { ReactNode } from 'react'

import { AppSidebar } from '#/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'

type ProtectedLayoutProps = {
  header?: ReactNode
  children: ReactNode
}

export function ProtectedLayout({ header, children }: ProtectedLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {header ? (
          <header className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur-sm">
            <div className="flex h-14 items-center gap-2 px-4 md:px-6">{header}</div>
          </header>
        ) : null}
        <div className="space-y-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
