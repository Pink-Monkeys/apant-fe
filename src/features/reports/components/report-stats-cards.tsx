import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import type { Report } from '#/features/reports/types'
import { FileText, ShieldAlert, AlertCircle, Award } from 'lucide-react'

type ReportStatsCardsProps = {
  reports: Report[]
}

export function ReportStatsCards({ reports }: ReportStatsCardsProps) {
  // 1. Total Reports
  const totalReports = reports.length

  // 2. Critical Reports
  const criticalReports = reports.filter((r) => r.overall_severity === 'critical').length

  // 3. Reports With Findings
  const reportsWithFindings = reports.filter((r) => r.statistics.total_vulnerabilities > 0).length

  // 4. Top Vulnerability
  const vulnCounts: Record<string, number> = {}
  reports.forEach((r) => {
    if (r.vulnerabilities) {
      r.vulnerabilities.forEach((v) => {
        vulnCounts[v.type] = (vulnCounts[v.type] || 0) + 1
      })
    }
  })

  let topVulnerability = 'None'
  let maxCount = 0
  Object.entries(vulnCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count
      topVulnerability = type
    }
  })

  const stats = [
    {
      label: 'Total Reports',
      value: String(totalReports),
      desc: 'Total pentest campaigns logged',
      icon: <FileText className="text-muted-foreground size-4" />,
    },
    {
      label: 'Critical Reports',
      value: String(criticalReports),
      desc: 'Requires immediate remediation',
      icon: <ShieldAlert className="text-destructive size-4" />,
    },
    {
      label: 'Reports With Findings',
      value: String(reportsWithFindings),
      desc: 'Scans with verified vulnerabilities',
      icon: <AlertCircle className="size-4 text-orange-500" />,
    },
    {
      label: 'Top Vulnerability',
      value: topVulnerability,
      desc: maxCount > 0 ? `${maxCount} occurrences found` : 'No vulnerabilities found',
      icon: <Award className="text-primary size-4" />,
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
            <CardDescription className="mt-1 truncate text-xs" title={item.desc}>
              {item.desc}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
