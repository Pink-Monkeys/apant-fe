import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import type { Report } from '#/features/reports/types'
import { ShieldCheck, ShieldAlert, BookOpen } from 'lucide-react'
import { cn } from '#/lib/utils'

type ReportsSummaryProps = {
  reports: Report[]
}

export function ReportsSummary({ reports }: ReportsSummaryProps) {
  if (reports.length === 0) {
    return null
  }

  const total = reports.length
  const withFindings = reports.filter((r) => r.statistics.total_vulnerabilities > 0).length
  const clean = reports.filter((r) => r.statistics.total_vulnerabilities === 0).length

  // Aggregate Vulnerabilities by Severity
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

  // Find dominant severity
  let dominantSeverityText = ''
  if (totalVulns > 0) {
    const dominantSeverities: string[] = []
    let maxVulns = 0

    const sevs = [
      { key: 'critical', label: 'Critical' },
      { key: 'high', label: 'High' },
      { key: 'medium', label: 'Medium' },
      { key: 'low', label: 'Low' },
      { key: 'informational', label: 'Informational' },
    ] as const

    sevs.forEach((s) => {
      const count = severityAgg[s.key]
      if (count > maxVulns) {
        maxVulns = count
        dominantSeverities.length = 0 // Reset
        dominantSeverities.push(s.label)
      } else if (count === maxVulns && count > 0) {
        dominantSeverities.push(s.label)
      }
    })

    const percentage = Math.round((maxVulns / totalVulns) * 100)
    dominantSeverityText = `${dominantSeverities.join(' and ')} severity accounts for ${percentage}% of all discovered vulnerabilities.`
  }

  // Dynamic analysis text
  const cleanText = `${clean} target${clean !== 1 ? 's are' : ' is'} considered secure`
  const findingsText = `${withFindings} target${withFindings !== 1 ? 's contain' : ' contains'} verified vulnerabilities`
  const summaryText = `Out of ${total} penetration test${total !== 1 ? 's' : ''} performed, ${findingsText} while ${cleanText}.${totalVulns > 0 ? ` ${dominantSeverityText}` : ' No vulnerabilities have been discovered across all scans.'}`

  // Security posture card color helper
  const isSecure = withFindings === 0
  const isHighRisk = severityAgg.critical > 0 || severityAgg.high > 0

  return (
    <Card className="border-primary border">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <BookOpen className="text-primary size-5" />
        <CardTitle className="text-base">Executive Security Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 border p-4">
          <p className="text-foreground/90 text-sm leading-relaxed font-medium">{summaryText}</p>
        </div>

        {/* Posture status panel */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className={cn(
              'flex items-start gap-3 border p-3.5',
              isSecure
                ? 'border-green-500/20 bg-green-500/5 text-green-700 dark:text-green-400'
                : isHighRisk
                  ? 'border-destructive/20 bg-destructive/5 text-destructive'
                  : 'border-orange-500/20 bg-orange-500/5 text-orange-700 dark:text-orange-400'
            )}
          >
            {isSecure ? (
              <ShieldCheck className="mt-0.5 size-5 shrink-0" />
            ) : (
              <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            )}
            <div>
              <span className="block text-xs font-bold tracking-wider uppercase">
                Overall Security Posture
              </span>
              <p className="mt-0.5 text-xs leading-relaxed font-medium">
                {isSecure
                  ? 'All assessed targets are clean. No vulnerabilities were detected by the AI agent during penetration testing.'
                  : isHighRisk
                    ? 'Attention required: Verified critical or high vulnerabilities are present in your target environments.'
                    : 'Caution: Moderate vulnerabilities have been detected. Review the findings table below for mitigation.'}
              </p>
            </div>
          </div>

          <div className="border-border bg-card text-card-foreground border p-3.5">
            <span className="text-muted-foreground block text-xs font-bold tracking-wider uppercase">
              Immediate Recommendations
            </span>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs leading-relaxed font-medium">
              {totalVulns > 0 ? (
                <>
                  {severityAgg.critical > 0 && (
                    <li>Remediate critical-level issues immediately.</li>
                  )}
                  {severityAgg.high > 0 && (
                    <li>Patch high-severity issues on login and authenticated screens.</li>
                  )}
                </>
              ) : (
                <>
                  <li>Continue running routine scans upon every deployment.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
