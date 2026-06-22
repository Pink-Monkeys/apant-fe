import { ScanRankingChart } from '#/components/dashboard/charts/scan-ranking-chart'
import { TopCategoriesChart } from '#/components/dashboard/charts/top-categories-chart'
import { HistorySessionTable } from '#/components/dashboard/table/history-session-table'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { ProtectedLayout } from '#/components/protected-layout'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { requireAuth } from '#/features/auth/guard'
import { useDashboardData } from '#/features/dashboard/hooks/use-dashboard-data'
import { createFileRoute } from '@tanstack/react-router'
import { ScanSearch, TimerReset, Users, Wrench } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => requireAuth(),
  component: Dashboard,
})

function Dashboard() {
  const { metrics: dashboardMetrics, scanRanking, topCategories } = useDashboardData()

  const metrics = [
    {
      label: 'Total Scans',
      value: `${dashboardMetrics.totalSessions}x`,
      delta: 'Total number of scans created',
      icon: <TimerReset className="size-4" />,
    },
    {
      label: "Today's Scans",
      value: `${dashboardMetrics.todaySession}x`,
      delta: 'Total number of scans today',
      icon: <Users className="size-4" />,
    },
    {
      label: 'Scan Results',
      value: `${dashboardMetrics.scanSuccess} Successes & ${dashboardMetrics.scanFailure} Failures`,
      delta: 'Total Number of Successful and Failed Executions',
      icon: <ScanSearch className="size-4" />,
    },
    {
      label: 'Total Tools Available',
      value: `${dashboardMetrics.totalTools}`,
      delta: 'Tools currently available',
      icon: <Wrench className="size-4" />,
    },
  ]

  return (
    <ProtectedLayout
      header={
        <>
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </>
      }
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <Card key={item.label} className="border-primary border">
            <CardHeader className="pb-0">
              <div className="text-muted-foreground flex items-center justify-between">
                <CardTitle className="text-xs tracking-wide uppercase">{item.label}</CardTitle>
                {item.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold tracking-tight">{item.value}</p>
              <CardDescription className="mt-1 text-xs">{item.delta}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex min-w-0 lg:flex-1">
          <ScanRankingChart data={scanRanking} />
        </div>
        <div className="flex min-w-0 lg:flex-1">
          <TopCategoriesChart data={topCategories} />
        </div>
      </section>

      <section className="flex">
        <HistorySessionTable />
      </section>
    </ProtectedLayout>
  )
}
