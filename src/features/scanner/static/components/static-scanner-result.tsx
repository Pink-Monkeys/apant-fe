import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { severityStyles } from '#/lib/severity'
import { cn } from '#/lib/utils'
import type { StaticScanResult } from '#/features/scanner/static/types'
import { CheckCircle2, FileText, Loader2, MinusCircle, ShieldCheck } from 'lucide-react'

type StaticScannerResultProps = {
  result: StaticScanResult | null
  isLoading: boolean
  elapsedMs?: number
}

export default function StaticScannerResult({
  result,
  isLoading,
  elapsedMs = 0,
}: StaticScannerResultProps) {
  if (isLoading) {
    return (
      <Card className="border-primary border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Scanning… this may take a few minutes
          </CardTitle>
          <CardDescription>
            The agent is analyzing your source code. Please keep this page open.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Elapsed time:{' '}
          <span className="text-foreground font-mono font-semibold">
            {formatElapsed(elapsedMs)}
          </span>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No scan data yet</CardTitle>
          <CardDescription>Upload a ZIP archive to start a static scan.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const severityKey = toSeverityKey(result.overall_severity)
  const severityStyle = severityStyles[severityKey]
  const sections = splitFinalAnswer(result.final_answer)

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="flex w-full flex-row flex-wrap gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Scan Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{result.duration}</p>
            <p className="text-muted-foreground text-sm">Total time required for scanning</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Files Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{result.file_count}</p>
            <p className="text-muted-foreground text-sm">Source files inspected</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Total Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{result.total_findings}</p>
            <p className="text-muted-foreground text-sm">Issues identified</p>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Overall Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={cn('border-transparent text-sm font-semibold', severityStyle.badge)}>
              {severityKey}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Analysis summary */}
      <Card className="border-primary border">
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
          <CardDescription>Triage output from the analysis agent.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.total_findings === 0 ? (
            <div className="border-border flex flex-col items-center justify-center gap-2 border border-dashed p-10 text-center">
              <ShieldCheck className="size-10 text-emerald-600" />
              <p className="font-medium">No issues found</p>
              <p className="text-muted-foreground text-sm">
                The static analysis did not identify any vulnerabilities in the source code.
              </p>
            </div>
          ) : null}

          {sections ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Confirmed
                </h3>
                <p className="border-border/50 bg-muted/30 border p-4 text-sm leading-relaxed whitespace-pre-line">
                  {sections.confirmed || 'None reported.'}
                </p>
              </div>
              {sections.notConfirmed ? (
                <div className="space-y-2">
                  <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-semibold">
                    <MinusCircle className="size-4" />
                    Not Confirmed
                  </h3>
                  <p className="border-border/50 bg-muted/10 text-muted-foreground border p-4 text-sm leading-relaxed whitespace-pre-line">
                    {sections.notConfirmed}
                  </p>
                </div>
              ) : null}
            </div>
          ) : result.final_answer ? (
            <p className="border-border/50 bg-muted/30 border p-4 text-sm leading-relaxed whitespace-pre-line">
              {result.final_answer}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {result.report_id ? (
        <Button asChild>
          <Link to="/reports/$reportId" params={{ reportId: result.report_id }}>
            <FileText className="size-4" />
            View Full Report
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

function toSeverityKey(severity: string): keyof typeof severityStyles {
  if (!severity) {
    return 'Informational'
  }
  const key = (severity.charAt(0).toUpperCase() + severity.slice(1)) as keyof typeof severityStyles
  return severityStyles[key] ? key : 'Informational'
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// final_answer is raw agent prose with two labeled sections. Split on the headings;
// return null when the expected format is missing so the caller can render it as-is.
function splitFinalAnswer(text: string): { confirmed: string; notConfirmed?: string } | null {
  if (!text) {
    return null
  }

  const confirmedMatch = text.match(/Confirmed vulnerabilities:/i)
  if (!confirmedMatch || confirmedMatch.index === undefined) {
    return null
  }

  const notConfirmedMatch = text.match(/Not confirmed as vulnerabilities:/i)
  const confirmedStart = confirmedMatch.index + confirmedMatch[0].length

  if (
    notConfirmedMatch &&
    notConfirmedMatch.index !== undefined &&
    notConfirmedMatch.index > confirmedMatch.index
  ) {
    return {
      confirmed: text.slice(confirmedStart, notConfirmedMatch.index).trim(),
      notConfirmed: text.slice(notConfirmedMatch.index + notConfirmedMatch[0].length).trim(),
    }
  }

  return { confirmed: text.slice(confirmedStart).trim() }
}
