import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import type { Report } from '#/features/reports/types'
import { FileText, ShieldAlert, AlertCircle, ShieldCheck } from 'lucide-react'

type ReportStatsCardsProps = {
  reports: Report[]
}

export function ReportStatsCards({ reports }: ReportStatsCardsProps) {
  const total = reports.length
  const withFindings = reports.filter((r) => r.statistics.total_vulnerabilities > 0).length
  const clean = reports.filter((r) => r.statistics.total_vulnerabilities === 0).length
  const critical = reports.filter((r) => r.overall_severity === 'critical').length

  const withFindingsPct = total > 0 ? Math.round((withFindings / total) * 100) : 0
  const cleanPct = total > 0 ? Math.round((clean / total) * 100) : 0
  const criticalPct = total > 0 ? Math.round((critical / total) * 100) : 0

  const stats = [
    {
      label: 'Total Reports',
      value: `${total} Report${total !== 1 ? 's' : ''}`,
      desc: total > 0 ? '100% completed scans' : 'No scans completed',
      icon: <FileText className="text-muted-foreground size-4" />,
    },
    {
      label: 'Reports With Findings',
      value: `${withFindings} Report${withFindings !== 1 ? 's' : ''}`,
      desc: `${withFindingsPct}% of all scans`,
      icon: <AlertCircle className="size-4 text-orange-500" />,
    },
    {
      label: 'Clean Reports',
      value: `${clean} Clean Report${clean !== 1 ? 's' : ''}`,
      desc: `${cleanPct}% secure targets`,
      icon: <ShieldCheck className="size-4 text-green-500" />,
    },
    {
      label: 'Critical Reports',
      value: `${critical} Critical Report${critical !== 1 ? 's' : ''}`,
      desc: `${criticalPct}% high-risk targets`,
      icon: <ShieldAlert className="text-destructive size-4" />,
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.label} className="border-primary border">
          <CardHeader className="pb-0">
            <div className="text-muted-foreground flex items-center justify-between">
              <CardTitle className="text-xs tracking-wide uppercase">{item.label}</CardTitle>
              {item.icon}
            </div>
          </CardHeader>
          <CardContent>
            <p className="truncate text-xl font-bold tracking-tight" title={item.value}>
              {item.value}
            </p>
            <CardDescription
              className="text-foreground/80 mt-1 truncate text-xs font-semibold"
              title={item.desc}
            >
              {item.desc}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
