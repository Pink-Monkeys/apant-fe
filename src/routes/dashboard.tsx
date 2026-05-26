import { AppSidebar } from '#/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '#/components/ui/breadcrumb'
import { Button } from '#/components/ui/button'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '#/components/ui/sidebar'
import { refreshToken } from '#/features/auth/api/auth-api'
import { getAuthSession, isAuthenticated, setAuthSession } from '#/features/auth/session'
import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  ArrowUpRight,
  CircleDollarSign,
  Clock3,
  Funnel,
  ListChecks,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'

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
    label: 'Total Revenue',
    value: 'Rp 184.200.000',
    delta: '+18.4% dari bulan lalu',
    icon: <CircleDollarSign className="size-4" />,
  },
  {
    label: 'Active Clients',
    value: '128',
    delta: '+7 klien baru minggu ini',
    icon: <Users className="size-4" />,
  },
  {
    label: 'Conversion Rate',
    value: '4.86%',
    delta: '+0.52% dari minggu lalu',
    icon: <TrendingUp className="size-4" />,
  },
  {
    label: 'Open Tasks',
    value: '23',
    delta: '8 prioritas tinggi',
    icon: <ListChecks className="size-4" />,
  },
]

const pipeline = [
  {
    name: 'Onboarding APANT Alpha',
    stage: 'Review',
    owner: 'Rizky',
    eta: 'Hari ini',
  },
  {
    name: 'Campaign Ramadan 2026',
    stage: 'Execution',
    owner: 'Nadia',
    eta: '2 hari',
  },
  {
    name: 'Migrasi Dashboard CRM',
    stage: 'Planning',
    owner: 'Bagas',
    eta: '4 hari',
  },
  {
    name: 'Enterprise Proposal',
    stage: 'Approval',
    owner: 'Fina',
    eta: '6 hari',
  },
]

const activity = [
  'Proposal APANT Enterprise disetujui oleh Finance.',
  'Integrasi notifikasi WhatsApp berhasil dipublish ke staging.',
  'Tim Sales menambahkan 5 lead baru dari webinar.',
  'Audit performa dashboard selesai tanpa blocker kritikal.',
]

function Dashboard() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background/95 sticky top-0 z-20 border-b backdrop-blur-sm">
          <div className="flex h-14 items-center gap-2 px-4 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Funnel className="size-4" />
                Filter
              </Button>
              <Button size="sm">
                <Zap className="size-4" />
                Quick Action
              </Button>
            </div>
          </div>
        </header>

        <div className="space-y-6 p-4 md:p-6">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => (
              <article
                key={item.label}
                className="bg-card text-card-foreground border p-4 shadow-sm"
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

          <section className="grid gap-4 lg:grid-cols-3">
            <article className="bg-card text-card-foreground border p-4 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Pipeline Progress</h2>
                  <p className="text-muted-foreground text-xs">
                    Pantau progress tim lintas divisi secara real-time.
                  </p>
                </div>
                <Button size="xs" variant="ghost">
                  Lihat semua
                  <ArrowUpRight className="size-3.5" />
                </Button>
              </div>

              <div className="space-y-2">
                {pipeline.map((item) => (
                  <div
                    key={item.name}
                    className="grid gap-2 border p-3 text-xs md:grid-cols-[1.8fr_0.8fr_0.8fr_0.8fr]"
                  >
                    <p className="text-foreground font-medium">{item.name}</p>
                    <p className="text-muted-foreground">{item.stage}</p>
                    <p className="text-muted-foreground">{item.owner}</p>
                    <p className="text-muted-foreground inline-flex items-center gap-1">
                      <Clock3 className="size-3.5" />
                      {item.eta}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <article className="bg-card text-card-foreground border p-4 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold">Latest Activity</h2>
              <p className="text-muted-foreground mb-4 text-xs">
                Update terakhir dari operasional APANT.
              </p>
              <ul className="space-y-2">
                {activity.map((item) => (
                  <li key={item} className="text-muted-foreground border p-3 text-xs">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
