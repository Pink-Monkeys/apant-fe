import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { getScanById, scanListQueryKeys } from '#/features/scanner/list/api/scan-list-api'
import { statusStyles } from '#/features/scanner/list/components/scan-list-columns'
import type { ScanStep } from '#/features/scanner/list/types'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import { cn, shortId } from '#/lib/utils'
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Clock,
  Globe,
  Loader2,
  Server,
  ShieldAlert,
  Terminal,
} from 'lucide-react'

type ScanDetailProps = {
  scanId: string
}

export function ScanDetail({ scanId }: ScanDetailProps) {
  const {
    data: scan,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: scanListQueryKeys.detail(scanId),
    queryFn: () => getScanById(scanId),
  })

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader2 className="text-primary size-8 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading scan...</span>
      </div>
    )
  }

  if (isError || !scan) {
    return (
      <div className="border-destructive/20 bg-destructive/5 flex h-64 flex-col items-center justify-center gap-3 border p-6">
        <AlertCircle className="text-destructive size-8" />
        <span className="text-destructive font-semibold">Failed to load scan</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Scan not found'}
        </span>
        <Button variant="outline" size="sm" asChild>
          <Link to="/scanner/list">
            <ArrowLeft className="size-3.5" />
            Back to Scan List
          </Link>
        </Button>
      </div>
    )
  }

  const statusStyle = statusStyles[scan.status] || 'bg-gray-500/10 text-gray-500'
  const statusLabel = scan.status.charAt(0).toUpperCase() + scan.status.slice(1)
  const steps = [...scan.steps].sort((a, b) => a.step - b.step)

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="space-y-3">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link to="/scanner/list">
            <ArrowLeft className="size-3.5" />
            Back to Scan List
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl leading-snug font-bold tracking-tight">Scan Detail</h1>
          <span
            className="bg-muted text-muted-foreground px-2 py-0.5 font-mono text-xs font-bold"
            title={scan.id}
          >
            {shortId('SCN', scan.id)}
          </span>
          <Badge className={cn('border border-transparent font-semibold', statusStyle)}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Scan Overview */}
      <Section icon={<Activity className="size-4" />} title="Scan Overview">
        <div className="border-border bg-card grid grid-cols-2 gap-3 border p-4 sm:grid-cols-4">
          <MetaItem label="Target">
            <span className="font-mono break-all">{scan.target}</span>
          </MetaItem>
          <MetaItem label="Scan Type">{scan.scan_type || '—'}</MetaItem>
          <MetaItem label="Provider">
            <span className="capitalize">{scan.provider || '—'}</span>
          </MetaItem>
          <MetaItem label="Model">
            <span className="font-mono">{scan.model || '—'}</span>
          </MetaItem>
          <MetaItem label="Duration">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {scan.duration || '—'}
            </span>
          </MetaItem>
          <MetaItem label="Total Steps">
            <span className="font-mono">{scan.steps.length}</span>
          </MetaItem>
          <MetaItem label="Created At">{new Date(scan.created_at).toLocaleString()}</MetaItem>
          <MetaItem label="Updated At">{new Date(scan.updated_at).toLocaleString()}</MetaItem>
        </div>
        {scan.description || scan.message ? (
          <div className="border-border/50 bg-muted/10 mt-3 border p-4 text-sm leading-relaxed">
            <span className="text-muted-foreground mb-1 block text-xs font-medium">
              {scan.description ? 'Description' : 'Message'}
            </span>
            {scan.description || scan.message}
          </div>
        ) : null}
      </Section>

      {/* Target Information */}
      {scan.target_info && (
        <Section icon={<Server className="size-4" />} title="Target Information">
          <InfoTable
            rows={[
              { label: 'Address', value: scan.target_info.address || '—', mono: true },
              { label: 'IP Address', value: scan.target_info.ip || '—', mono: true },
              { label: 'Web Server', value: scan.target_info.server || 'Unknown' },
              {
                label: 'Operating System',
                value: scan.target_info.operating_system || 'Unknown',
              },
              { label: 'CDN Protection', value: scan.target_info.cdn?.toUpperCase() || 'None' },
              { label: 'Page Title', value: scan.target_info.title || '—' },
              {
                label: 'Page Status',
                value:
                  scan.target_info.status_code || scan.target_info.status
                    ? `${scan.target_info.status_code ?? ''} ${scan.target_info.status ?? ''}`.trim()
                    : '—',
              },
            ]}
          />
          {scan.target_info.technologies && scan.target_info.technologies.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              <span className="text-muted-foreground text-xs font-medium">Technologies</span>
              <div className="flex flex-wrap gap-1.5">
                {scan.target_info.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-[10px] font-medium">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </Section>
      )}

      {/* Final Answer */}
      {scan.final_answer ? (
        <Section icon={<Globe className="size-4" />} title="Analysis Summary">
          <p className="border-border/50 bg-muted/30 border p-4 text-sm leading-relaxed whitespace-pre-line">
            {scan.final_answer}
          </p>
        </Section>
      ) : null}

      {/* Steps */}
      <Section icon={<Terminal className="size-4" />} title={`Steps (${steps.length})`}>
        {steps.length === 0 ? (
          <div className="border-border text-muted-foreground border border-dashed p-10 text-center text-sm">
            No steps recorded for this scan.
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {steps.map((step) => (
              <ScanStepItem key={step.step} step={step} />
            ))}
          </Accordion>
        )}
      </Section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScanStepItem({ step }: { step: ScanStep }) {
  const isExploited = step.result?.exploit_success === true

  return (
    <AccordionItem value={String(step.step)} className="border-border bg-card border">
      <AccordionTrigger className="px-4 py-3 hover:no-underline">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
          <span className="bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold">
            #{step.step}
          </span>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {step.tool}
          </Badge>
          {isExploited ? (
            <Badge className="bg-destructive border-transparent text-[10px] text-white">
              <ShieldAlert className="size-3" />
              Exploited
            </Badge>
          ) : null}
          {step.summary ? (
            <span className="text-muted-foreground truncate text-xs">{step.summary}</span>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <KeyValueBlock title="Params" data={step.params} />
          <KeyValueBlock title="Result" data={step.result} />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function KeyValueBlock({ title, data }: { title: string; data?: Record<string, unknown> }) {
  const entries = data ? Object.entries(data) : []

  return (
    <div className="space-y-2">
      <span className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
        {title}
      </span>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-xs">—</p>
      ) : (
        <div className="divide-border/50 border-border/50 bg-muted/10 divide-y border">
          {entries.map(([key, value]) => (
            <div key={key} className="space-y-1 p-2.5 text-xs">
              <span className="text-muted-foreground block font-medium">{formatLabel(key)}</span>
              <ValueRenderer value={value} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ValueRenderer({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">—</span>
  }

  if (typeof value === 'object') {
    return (
      <pre className="bg-muted border-border/40 max-h-64 overflow-auto border p-2 font-mono text-[11px] leading-relaxed whitespace-pre">
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  }

  const text = String(value)
  // Long or multiline values (body_preview, output, headers) get a scrollable block.
  if (text.length > 80 || text.includes('\n')) {
    return (
      <pre className="bg-muted border-border/40 max-h-64 overflow-auto border p-2 font-mono text-[11px] leading-relaxed break-all whitespace-pre-wrap">
        {text}
      </pre>
    )
  }

  return <span className="font-mono break-all">{text}</span>
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

function formatLabel(label: string): string {
  return label.replace(/_/g, ' ')
}
