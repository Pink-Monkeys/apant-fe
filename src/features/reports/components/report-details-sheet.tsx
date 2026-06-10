import { useState } from 'react'
import { Sheet, SheetContent } from '#/components/ui/sheet'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { severityStyles } from '#/lib/severity'
import type { Report } from '#/features/reports/types'
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
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { toast } from 'sonner'

type ReportDetailsSheetProps = {
  report: Report | null
  isOpen: boolean
  onClose: () => void
}

export function ReportDetailsSheet({ report, isOpen, onClose }: ReportDetailsSheetProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!report) return null

  const severityKey = (report.overall_severity.charAt(0).toUpperCase() +
    report.overall_severity.slice(1)) as keyof typeof severityStyles
  const overallSeverityStyle = severityStyles[severityKey] || severityStyles.Informational

  const handleCopyCurl = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd)
    setCopiedId(id)
    toast.success('cURL command copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const shortId = `RPT-${report.id.substring(report.id.length - 4).toUpperCase()}`

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="border-border bg-card text-foreground w-full overflow-y-auto border-l p-0 sm:max-w-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-border space-y-4 border-b p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground bg-muted px-2 py-0.5 font-mono text-xs font-bold">
                    {shortId}
                  </span>
                  <Badge
                    className={cn('border-transparent font-semibold', overallSeverityStyle.badge)}
                  >
                    {severityKey} Severity
                  </Badge>
                </div>
                <h2 className="mt-2 text-xl font-bold tracking-tight">{report.title}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs md:grid-cols-4">
              <div className="space-y-1">
                <span className="text-muted-foreground block">Target URL</span>
                <a
                  href={report.metadata.target}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex max-w-full items-center gap-1 truncate font-medium hover:underline"
                >
                  {report.metadata.target}
                  <ExternalLink className="size-3 flex-shrink-0" />
                </a>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Scan Date</span>
                <span className="font-medium">
                  {new Date(report.metadata.scan_date).toLocaleDateString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Duration</span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <Clock className="size-3" />
                  {report.metadata.duration}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">AI Engine</span>
                <span className="font-medium uppercase">
                  {report.metadata.provider} ({report.metadata.model})
                </span>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 space-y-6 p-6">
            {/* Executive Summary */}
            {report.executive_summary && (
              <div className="space-y-2">
                <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                  <Activity className="size-4" />
                  Executive Summary
                </h3>
                <p className="bg-muted/30 border-border/50 border p-4 text-sm leading-relaxed">
                  {report.executive_summary}
                </p>
              </div>
            )}

            {/* Target & Attack Surface Details */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Target Info */}
              {report.target_info && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <Server className="size-4" />
                    Target Information
                  </h3>
                  <div className="border-border/50 divide-border/50 bg-muted/10 divide-y border text-xs">
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">IP Address</span>
                      <span className="font-mono">{report.target_info.ip_address || '—'}</span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">Web Server</span>
                      <span>{report.target_info.web_server || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">Operating System</span>
                      <span>{report.target_info.operating_system || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">CDN Protection</span>
                      <span className="uppercase">{report.target_info.cdn || 'None'}</span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">Tech Stack</span>
                      <span>{report.target_info.tech_stack?.join(', ') || 'Not detected'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attack Surface */}
              {report.attack_surface && (
                <div className="space-y-3">
                  <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                    <Globe className="size-4" />
                    Attack Surface Mapping
                  </h3>
                  <div className="border-border/50 divide-border/50 bg-muted/10 divide-y border text-xs">
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">URLs Crawled</span>
                      <span className="font-semibold">{report.attack_surface.urls_crawled}</span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">Parameterized Endpoints</span>
                      <span className="font-semibold">
                        {report.attack_surface.parameterized_endpoints}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">Open Ports Found</span>
                      <span className="font-semibold">
                        {report.attack_surface.open_ports_count}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">Subdomains Found</span>
                      <span className="font-semibold">
                        {report.attack_surface.subdomains_found}
                      </span>
                    </div>
                    <div className="flex justify-between p-2.5">
                      <span className="text-muted-foreground">Tools Executed</span>
                      <span
                        className="max-w-[200px] truncate"
                        title={report.metadata.tools_used.join(', ')}
                      >
                        {report.metadata.tools_used.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Findings & Vulnerabilities */}
            <div className="space-y-4">
              <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                <Shield className="size-4" />
                Vulnerabilities Found ({report.statistics.total_vulnerabilities})
              </h3>

              {!report.vulnerabilities || report.vulnerabilities.length === 0 ? (
                <div className="border-border flex flex-col items-center justify-center border border-dashed p-8 text-center">
                  <ShieldCheck className="mb-2 size-8 text-green-500" />
                  <p className="text-sm font-medium">No Vulnerabilities Detected</p>
                  <p className="text-muted-foreground mt-1 text-xs">
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
                      <div
                        key={vuln.id}
                        className="border-border bg-muted/5 divide-border divide-y border"
                      >
                        {/* Vuln Header */}
                        <div className="flex items-start justify-between gap-4 p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
                                {vuln.id}
                              </span>
                              <Badge
                                className={cn('border-transparent text-[10px]', vulnStyle.badge)}
                              >
                                {vulnSevKey}
                              </Badge>
                              {vuln.verified && (
                                <Badge className="border-transparent bg-green-600 text-[10px] text-white">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <h4 className="mt-1 text-sm font-semibold">{vuln.title}</h4>
                          </div>
                        </div>

                        {/* Vuln Body */}
                        <div className="space-y-3 p-4 text-xs leading-relaxed">
                          <div>
                            <span className="text-muted-foreground mb-0.5 block font-medium">
                              Location
                            </span>
                            <span className="bg-muted px-1 py-0.5 font-mono break-all">
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

                          {/* Proof of Concept */}
                          {vuln.poc && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-muted-foreground block font-medium">
                                Proof of Concept
                              </span>
                              <div className="bg-muted text-foreground border-border group relative border p-3 font-mono">
                                <div className="text-muted-foreground border-border/40 mb-2 flex items-center justify-between border-b pb-1.5 text-[10px]">
                                  <span>
                                    {vuln.poc.method} - {vuln.poc.url}
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
                                <code className="block text-[11px] break-all whitespace-pre-wrap">
                                  {vuln.poc.curl_cmd}
                                </code>
                              </div>
                            </div>
                          )}

                          <div className="pt-1">
                            <span className="text-muted-foreground mb-0.5 block font-medium">
                              Recommendation
                            </span>
                            <p className="text-muted-foreground bg-primary/5 border-primary border-l-2 p-2.5">
                              {vuln.recommendation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Conclusion */}
            {report.conclusion && (
              <div className="border-border space-y-2 border-t pt-2">
                <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold tracking-wider uppercase">
                  <ShieldCheck className="size-4" />
                  Conclusion
                </h3>
                <p className="bg-muted/10 border-border/50 border p-4 text-sm leading-relaxed">
                  {report.conclusion}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-border bg-muted/20 flex justify-end gap-2 border-t p-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
