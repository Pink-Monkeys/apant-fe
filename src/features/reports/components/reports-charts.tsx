import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import type { Report } from '#/features/reports/types'
import { cn } from '#/lib/utils'

type ReportsChartsProps = {
  reports: Report[]
}

export function ReportsCharts({ reports }: ReportsChartsProps) {
  if (reports.length === 0) {
    return null
  }

  // 1. Calculate Target Posture (Clean vs At-Risk)
  const total = reports.length
  const withFindings = reports.filter((r) => r.statistics.total_vulnerabilities > 0).length
  const clean = reports.filter((r) => r.statistics.total_vulnerabilities === 0).length

  // 2. Calculate Security Score
  const securityScore = total > 0 ? Math.round((clean / total) * 100) : 100

  // Determine Risk Level text and style
  let riskLevel = 'Minimal'
  let riskColor = 'text-green-500'
  if (securityScore < 50) {
    riskLevel = 'High'
    riskColor = 'text-destructive font-bold'
  } else if (securityScore < 80) {
    riskLevel = 'Medium'
    riskColor = 'text-orange-500 font-bold'
  } else if (securityScore < 100) {
    riskLevel = 'Low'
    riskColor = 'text-blue-500 font-bold'
  }

  // 3. Aggregate Vulnerabilities by Severity
  const severityAgg = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  }

  reports.forEach((r) => {
    if (r.statistics && r.statistics.by_severity) {
      severityAgg.critical += r.statistics.by_severity.critical || 0
      severityAgg.high += r.statistics.by_severity.high || 0
      severityAgg.medium += r.statistics.by_severity.medium || 0
      severityAgg.low += r.statistics.by_severity.low || 0
      severityAgg.informational += r.statistics.by_severity.informational || 0
    }
  })

  const totalVulns =
    severityAgg.critical +
    severityAgg.high +
    severityAgg.medium +
    severityAgg.low +
    severityAgg.informational

  // Donut chart data
  const donutData = [
    { name: 'Secure Targets', value: clean, color: '#10b981' }, // emerald-500
    { name: 'At-Risk Targets', value: withFindings, color: '#ef4444' }, // red-500
  ].filter((item) => item.value > 0)

  // In case all values are zero, provide a default layout
  const chartData =
    donutData.length > 0 ? donutData : [{ name: 'No Data', value: 1, color: '#9ca3af' }]

  const severityLevels = [
    {
      key: 'critical',
      label: 'Critical',
      color: 'bg-purple-700',
      text: 'text-purple-700 dark:text-purple-400',
    },
    { key: 'high', label: 'High', color: 'bg-destructive', text: 'text-destructive' },
    { key: 'medium', label: 'Medium', color: 'bg-orange-500', text: 'text-orange-500' },
    { key: 'low', label: 'Low', color: 'bg-blue-500', text: 'text-blue-500' },
    {
      key: 'informational',
      label: 'Informational',
      color: 'bg-gray-500',
      text: 'text-muted-foreground',
    },
  ] as const

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Target Security Posture & Score */}
      <Card className="border-primary flex flex-col border">
        <CardHeader className="pb-0">
          <CardTitle>Security Posture</CardTitle>
          <CardDescription>
            Distribution of clean vs at-risk targets and overall security score
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center py-6">
          <div className="relative flex h-48 w-full items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Absolute positioning in center of donut */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                Score
              </span>
              <span className="font-mono text-3xl leading-none font-extrabold">
                {securityScore}/100
              </span>
              <span className={cn('mt-1 text-[11px] font-semibold uppercase', riskColor)}>
                Risk: {riskLevel}
              </span>
            </div>
          </div>

          {/* Legends */}
          <div className="mt-2 flex justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2.5 bg-[#10b981]" />
              <span className="text-muted-foreground font-medium">Secure Targets ({clean})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 bg-[#ef4444]" />
              <span className="text-muted-foreground font-medium">
                At-Risk Targets ({withFindings})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vulnerability Severity Distribution */}
      <Card className="border-primary flex flex-col border">
        <CardHeader className="pb-2">
          <CardTitle>Vulnerability Distribution</CardTitle>
          <CardDescription>Discovered vulnerabilities aggregated by severity level</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-center space-y-4 py-4">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-muted-foreground text-xs font-semibold">Severity</span>
            <span className="text-muted-foreground text-xs font-semibold">
              Distribution & Count
            </span>
          </div>

          <div className="space-y-3">
            {severityLevels.map((sev) => {
              const count = severityAgg[sev.key]
              const pct = totalVulns > 0 ? Math.round((count / totalVulns) * 100) : 0

              return (
                <div key={sev.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className={cn('font-bold tracking-wider uppercase', sev.text)}>
                      {sev.label}
                    </span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {pct}% <span className="font-sans text-[10px]">({count})</span>
                    </span>
                  </div>
                  {/* Progress Bar Track */}
                  <div className="bg-muted border-border h-2.5 rounded-none border">
                    <div
                      className={cn('h-full transition-all duration-300', sev.color)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-muted-foreground pt-2 text-center text-xs font-medium">
            Total Discovered Vulnerabilities:{' '}
            <span className="text-foreground font-mono font-bold">{totalVulns}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
