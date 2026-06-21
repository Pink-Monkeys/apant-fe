import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getReportDetail, reportsQueryKeys } from '#/features/reports/api/reports-api'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { severityStyles } from '#/lib/severity'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  Shield,
  ShieldCheck,
  Globe,
  Copy,
  Check,
  Server,
  Activity,
  Clock,
  ExternalLink,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Download,
} from 'lucide-react'
import { cn, shortId } from '#/lib/utils'
import { toast } from 'sonner'

type ReportDetailProps = {
  reportId: string
}

export function ReportDetail({ reportId }: ReportDetailProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const {
    data: report,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: reportsQueryKeys.detail(reportId),
    queryFn: () => getReportDetail(reportId),
  })

  const handleCopyCurl = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd)
    setCopiedId(id)
    toast.success('cURL command copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Generate the PDF on-demand (client-side, vector output via @react-pdf/renderer).
  // The library is loaded lazily so it stays out of the initial route bundle.
  const handleDownloadPdf = async () => {
    if (!report) return
    setIsGeneratingPdf(true)
    try {
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('#/features/reports/components/report-pdf'),
      ])
      const blob = await pdf(<ReportDocument report={report} />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report-${report.id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate report PDF', err)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader2 className="text-primary size-8 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading report...</span>
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="border-destructive/20 bg-destructive/5 flex h-64 flex-col items-center justify-center gap-3 border p-6">
        <AlertCircle className="text-destructive size-8" />
        <span className="text-destructive font-semibold">Failed to load report</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Report not found'}
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link to="/reports">
            <ArrowLeft className="size-3.5" />
            Back to Reports
          </Link>
        </Button>
      </div>
    )
  }

  const severityKey = (report.overall_severity.charAt(0).toUpperCase() +
    report.overall_severity.slice(1)) as keyof typeof severityStyles
  const overallSeverityStyle = severityStyles[severityKey] || severityStyles.Informational

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <Button variant="outline" size="sm" asChild className="mt-0.5 shrink-0">
          <Link to="/reports">
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
        </Button>
        <Button
          size="sm"
          onClick={handleDownloadPdf}
          disabled={isGeneratingPdf}
          className="mt-0.5 shrink-0"
        >
          {isGeneratingPdf ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="size-3.5" />
              Download PDF
            </>
          )}
        </Button>
      </div>
      <div className="mt-10 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="bg-muted text-muted-foreground px-2 py-0.5 font-mono text-xs font-bold"
            title={report.id}
          >
            {shortId('RPT', report.id)}
          </span>
          <Badge className={cn('border-transparent font-semibold', overallSeverityStyle.badge)}>
            {severityKey} Severity
          </Badge>
        </div>
        <h1 className="text-xl leading-snug font-bold tracking-tight">{report.title}</h1>
      </div>

      {/* Meta Grid */}
      <div className="border-border bg-card grid grid-cols-2 gap-3 border p-4 sm:grid-cols-4">
        <MetaItem label="Target URL">
          <a
            href={report.metadata.target}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1 font-medium hover:underline"
          >
            <span className="truncate">{report.metadata.target}</span>
            <ExternalLink className="size-3 shrink-0" />
          </a>
        </MetaItem>
        <MetaItem label="Scan Date">
          {new Date(report.metadata.scan_date).toLocaleDateString()}
        </MetaItem>
        <MetaItem label="Duration">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            {report.metadata.duration}
          </span>
        </MetaItem>
        <MetaItem label="AI Engine">
          <span className="uppercase">
            {report.metadata.provider} / {report.metadata.model}
          </span>
        </MetaItem>
      </div>

      {/* Executive Summary */}
      {report.executive_summary && (
        <Section icon={<Activity className="size-4" />} title="Executive Summary">
          <p className="border-border/50 bg-muted/30 border p-4 text-sm leading-relaxed">
            {report.executive_summary}
          </p>
        </Section>
      )}

      {/* Vulnerability Distribution */}
      {report.statistics && report.statistics.by_severity && (
        <VulnerabilityDistribution
          bySeverity={report.statistics.by_severity}
          total={report.statistics.total_vulnerabilities}
        />
      )}

      {/* Target Info + Attack Surface */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {report.target_info && (
          <Section icon={<Server className="size-4" />} title="Target Information">
            <InfoTable
              rows={[
                { label: 'IP Address', value: report.target_info.ip_address || '—', mono: true },
                { label: 'Web Server', value: report.target_info.web_server || 'Unknown' },
                {
                  label: 'Operating System',
                  value: report.target_info.operating_system || 'Unknown',
                },
                { label: 'CDN Protection', value: report.target_info.cdn?.toUpperCase() || 'None' },
                {
                  label: 'Tech Stack',
                  value: report.target_info.tech_stack?.join(', ') || 'Not detected',
                },
                {
                  label: 'Page Status',
                  value: `${report.target_info.status_code} ${report.target_info.status}`,
                },
              ]}
            />
          </Section>
        )}

        {report.attack_surface && (
          <Section icon={<Globe className="size-4" />} title="Attack Surface Mapping">
            <InfoTable
              rows={[
                {
                  label: 'URLs Crawled',
                  value: String(report.attack_surface.urls_crawled),
                  mono: true,
                },
                {
                  label: 'Parameterized Endpoints',
                  value: String(report.attack_surface.parameterized_endpoints),
                  mono: true,
                },
                {
                  label: 'Open Ports Found',
                  value: String(report.attack_surface.open_ports_count),
                  mono: true,
                },
                {
                  label: 'Subdomains Found',
                  value: String(report.attack_surface.subdomains_found),
                  mono: true,
                },
                { label: 'Tools Executed', value: report.metadata.tools_used.join(', ') },
                { label: 'Agent Steps', value: String(report.metadata.total_steps), mono: true },
              ]}
            />
          </Section>
        )}
      </div>

      {/* Vulnerabilities */}
      <Section
        icon={<Shield className="size-4" />}
        title={`Vulnerabilities Found (${report.statistics.total_vulnerabilities})`}
      >
        {!report.vulnerabilities || report.vulnerabilities.length === 0 ? (
          <div className="border-border flex flex-col items-center justify-center gap-2 border border-dashed p-10 text-center">
            <ShieldCheck className="size-10 text-green-500" />
            <p className="font-medium">No Vulnerabilities Detected</p>
            <p className="text-muted-foreground text-xs">
              The automated scanner did not identify any exploits on the target endpoints.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {report.vulnerabilities.map((vuln) => {
              const vulnSevKey = (vuln.severity.charAt(0).toUpperCase() +
                vuln.severity.slice(1)) as keyof typeof severityStyles
              const vulnStyle = severityStyles[vulnSevKey] || severityStyles.Informational

              return (
                <div key={vuln.id} className="divide-border border-border bg-card divide-y border">
                  {/* Vuln Header */}
                  <div className="flex flex-wrap items-center gap-2 p-4">
                    <span className="bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
                      {vuln.id}
                    </span>
                    <Badge className={cn('border-transparent text-[10px]', vulnStyle.badge)}>
                      {vulnSevKey}
                    </Badge>
                    {vuln.verified && (
                      <Badge className="border-transparent bg-green-600 text-[10px] text-white">
                        Verified
                      </Badge>
                    )}
                    <span className="ml-1 text-sm font-semibold">{vuln.title}</span>
                  </div>

                  {/* Vuln Body */}
                  <div className="grid grid-cols-1 gap-4 p-4 text-xs leading-relaxed md:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <span className="text-muted-foreground mb-0.5 block font-medium">
                          Location
                        </span>
                        <span className="bg-muted block px-1.5 py-1 font-mono break-all">
                          {vuln.location}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground mb-0.5 block font-medium">
                          Description
                        </span>
                        <p className="text-muted-foreground">{vuln.description}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground mb-0.5 block font-medium">
                          Impact
                        </span>
                        <p className="text-muted-foreground">{vuln.impact}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Proof of Concept */}
                      {vuln.poc && (
                        <div>
                          <span className="text-muted-foreground mb-1 block font-medium">
                            Proof of Concept
                          </span>
                          <div className="border-border bg-muted border font-mono">
                            <div className="border-border/40 text-muted-foreground flex items-center justify-between border-b px-3 py-1.5 text-[10px]">
                              <span>
                                {vuln.poc.method} &mdash;{' '}
                                {(() => {
                                  try {
                                    return new URL(vuln.poc.url).hostname
                                  } catch {
                                    return vuln.poc.url
                                  }
                                })()}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="hover:bg-background h-5 w-5"
                                onClick={() => handleCopyCurl(vuln.poc.curl_cmd, vuln.id)}
                              >
                                {copiedId === vuln.id ? (
                                  <Check className="size-3 text-green-500" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </Button>
                            </div>
                            <code className="block p-3 text-[11px] break-all whitespace-pre-wrap">
                              {vuln.poc.curl_cmd}
                            </code>
                          </div>
                        </div>
                      )}

                      <div>
                        <span className="text-muted-foreground mb-0.5 block font-medium">
                          Recommendation
                        </span>
                        <p className="border-primary bg-primary/5 text-muted-foreground border-l-2 p-2.5">
                          {vuln.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* Mitigation */}
      {report.mitigation && (
        <Section icon={<Shield className="size-4" />} title="Mitigation & Remediation">
          <p className="border-primary/30 bg-primary/5 border-l-4 p-4 text-sm leading-relaxed">
            {report.mitigation}
          </p>
        </Section>
      )}

      {/* Conclusion */}
      {report.conclusion && (
        <Section icon={<ShieldCheck className="size-4" />} title="Conclusion">
          <p className="border-border/50 bg-muted/10 border p-4 text-sm leading-relaxed">
            {report.conclusion}
          </p>
        </Section>
      )}
    </div>
  )
}

// Sub-components

type VulnerabilityDistributionProps = {
  bySeverity: {
    critical: number
    high: number
    medium: number
    low: number
    informational: number
  }
  total: number
}

function VulnerabilityDistribution({ bySeverity, total }: VulnerabilityDistributionProps) {
  const severityLevels = [
    {
      key: 'critical' as const,
      label: 'Critical',
      style: severityStyles.Critical,
    },
    {
      key: 'high' as const,
      label: 'High',
      style: severityStyles.High,
    },
    {
      key: 'medium' as const,
      label: 'Medium',
      style: severityStyles.Medium,
    },
    {
      key: 'low' as const,
      label: 'Low',
      style: severityStyles.Low,
    },
    {
      key: 'informational' as const,
      label: 'Informational',
      style: severityStyles.Informational,
    },
  ] as const

  const donutData = severityLevels
    .map((sev) => ({
      name: sev.label,
      value: bySeverity[sev.key] || 0,
      color: sev.style.hex,
    }))
    .filter((d) => d.value > 0)

  // If all zero, show a fallback single entry
  const chartData =
    donutData.length > 0
      ? donutData
      : [{ name: 'No Data', value: 1, color: severityStyles.Informational.hex }]

  return (
    <Section icon={<Activity className="size-4" />} title="Vulnerability Distribution">
      <Card className="border-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Severity Breakdown</CardTitle>
          <CardDescription>
            Discovered vulnerabilities aggregated by severity level for this report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex h-44 w-full items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center total count */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Total
                  </span>
                  <span className="font-mono text-2xl leading-none font-extrabold">{total}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                {severityLevels.map((sev) => {
                  const count = bySeverity[sev.key] || 0
                  if (count === 0) return null
                  return (
                    <div key={sev.key} className="flex items-center gap-1.5">
                      <span
                        className="size-2.5 shrink-0"
                        style={{ backgroundColor: sev.style.hex }}
                      />
                      <span className="text-muted-foreground font-medium">
                        {sev.label} ({count})
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1.5">
                <span className="text-muted-foreground text-xs font-semibold">Severity</span>
                <span className="text-muted-foreground text-xs font-semibold">
                  Percentage & Count
                </span>
              </div>

              {severityLevels.map((sev) => {
                const count = bySeverity[sev.key] || 0
                const pct = total > 0 ? Math.round((count / total) * 100) : 0

                return (
                  <div key={sev.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className={cn('font-bold tracking-wider uppercase', sev.style.text)}>
                        {sev.label}
                      </span>
                      <span className="text-muted-foreground font-mono text-xs">
                        {pct}% <span className="font-sans text-[10px]">({count})</span>
                      </span>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="bg-muted border-border h-2.5 rounded-none border">
                      <div
                        className={cn('h-full transition-all duration-300', sev.style.bg)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}

              <div className="text-muted-foreground pt-1 text-center text-xs font-medium">
                Total Discovered Vulnerabilities:{' '}
                <span className="text-foreground font-mono font-bold">{total}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Section>
  )
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5 text-xs">
      <span className="text-muted-foreground block">{label}</span>
      <div className="font-medium">{children}</div>
    </div>
  )
}

type InfoRow = { label: string; value: string; mono?: boolean }

function InfoTable({ rows }: { rows: InfoRow[] }) {
  return (
    <div className="divide-border/50 border-border/50 bg-muted/10 divide-y border text-xs">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-4 p-2.5">
          <span className="text-muted-foreground shrink-0">{row.label}</span>
          <span className={cn('text-right break-all', row.mono && 'font-mono')}>{row.value}</span>
        </div>
      ))}
    </div>
  )
}
