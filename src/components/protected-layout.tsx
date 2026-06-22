import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'

import { AppSidebar } from '#/components/app-sidebar'
import { ThemeToggleButton } from '#/components/theme-toggle-button'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { authSessionKey, getAuthSession } from '#/features/auth/session'
import { useTokenRefresh } from '#/features/auth/hooks/use-token-refresh'

type ProtectedLayoutProps = {
  header?: ReactNode
  children: ReactNode
}

export function ProtectedLayout({ header, children }: ProtectedLayoutProps) {
  useTokenRefresh()

  const { data: session } = useQuery({
    queryKey: authSessionKey,
    queryFn: () => getAuthSession(),
    initialData: getAuthSession(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
  const displayName =
    session?.user.username ?? session?.user.email ?? `User-${session?.user.id ?? 'Guest'}`

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur-sm">
          <div className="flex h-14 items-center gap-2 px-4 md:px-6">
            {header}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm font-bold">Hi, Pentester {displayName}!</span>
              <ThemeToggleButton />
            </div>
          </div>
        </header>
        <div className="space-y-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
