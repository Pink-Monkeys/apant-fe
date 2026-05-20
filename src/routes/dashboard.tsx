import { AppSidebar } from '#/components/app-sidebar'
import { ScanRankingChart } from '#/components/dashboard/charts/scan-ranking-chart'
import { TopCategoriesChart } from '#/components/dashboard/charts/top-categories-chart'
import { HistorySessionTable } from '#/components/dashboard/table/history-session-table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'
import { refreshToken } from '#/features/auth/api/auth-api'
import { getAuthSession, isAuthenticated, setAuthSession } from '#/features/auth/session'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ScanSearch, TimerReset, Users, Wrench } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    if (isAuthenticated()) {
      return
    }

    try {
      const response = await refreshToken()
      if (response.data?.user) {
        setAuthSession({
          tokenType: response.data.token_type,
          expiresIn: response.data.expires_in,
          user: response.data.user,
        })
        return
      }
    } catch {
      // ignore and redirect below
    }

    const session = getAuthSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
  component: Dashboard,
})

const metrics = [
  {
    label: 'Total Sessions',
    value: '207x',
    delta: 'Total number of sessions created',
    icon: <TimerReset className="size-4" />,
  },
  {
    label: "Today's Session",
    value: '21x',
    delta: 'Total number of sessions today',
    icon: <Users className="size-4" />,
  },
  {
    label: 'Scan Results',
    value: '201 Successes & 7 Failures',
    delta: 'Total Number of Successful and Failed Executions',
    icon: <ScanSearch className="size-4" />,
  },
  {
    label: 'Total Tools Available',
    value: '21',
    delta: 'Total amount available',
    icon: <Wrench className="size-4" />,
  },
]

function Dashboard() {
  const session = getAuthSession()
  const displayName =
    session?.user.username ?? session?.user.email ?? `User-${session?.user.id ?? 'Guest'}`

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur-sm">
          <div className="flex h-14 items-center gap-2 px-4 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="flex w-full flex-row justify-between">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      <b>Hi, Pentester {displayName}!</b>
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            {/* <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Funnel className="size-4" />
                Filter
              </Button>
              <Button size="sm">
                <Zap className="size-4" />
                Quick Action
              </Button>
            </div> */}
          </div>
        </header>

        <div className="space-y-6 p-4 md:p-6">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => (
              <article
                key={item.label}
                className="bg-card text-card-foreground border-chart-1 border p-4"
              >
                <div className="text-muted-foreground mb-2 flex items-center justify-between">
                  <p className="text-xs tracking-wide uppercase">{item.label}</p>
                  {item.icon}
                </div>
                <p className="text-xl font-bold tracking-tight">{item.value}</p>
                <p className="text-muted-foreground mt-1 text-xs">{item.delta}</p>
              </article>
            ))}
          </section>

          <section className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
            <div className="flex min-w-0 lg:flex-1">
              <ScanRankingChart />
            </div>
            <div className="flex min-w-0 lg:flex-1">
              <TopCategoriesChart />
            </div>
          </section>

          <section className="flex">
            <HistorySessionTable />
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
