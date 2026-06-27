import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { cn } from '#/lib/utils'
import { severityStyles } from '#/lib/severity'
import {
  useRemediation,
  type RemediationSeverity,
} from '#/features/recommendations/hooks/use-remediation'

const SEVERITY_FILTER_ORDER: RemediationSeverity[] = [
  'Critical',
  'High',
  'Medium',
  'Low',
  'Informational',
]

type SeverityFilter = RemediationSeverity | 'All'

export function RemediationView() {
  const { groups, isLoading, isError, error } = useRemediation()
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All')

  const availableSeverities = useMemo(
    () => SEVERITY_FILTER_ORDER.filter((severity) => groups.some((g) => g.severity === severity)),
    [groups]
  )

  const visibleGroups = useMemo(
    () =>
      severityFilter === 'All'
        ? groups
        : groups.filter((group) => group.severity === severityFilter),
    [groups, severityFilter]
  )

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader2 className="text-primary size-8 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading remediation items...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex h-64 flex-col items-center justify-center gap-2 border p-4">
        <AlertCircle className="size-8" />
        <span className="font-semibold">Failed to load remediation</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="border-border flex h-64 flex-col items-center justify-center gap-2 border border-dashed p-6 text-center">
        <ShieldCheck className="size-10 text-emerald-600" />
        <p className="font-medium">No remediation items yet</p>
        <p className="text-muted-foreground text-sm">Run a scan to generate findings.</p>
      </div>
    )
  }

  return (
    <Card className="border-primary border">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Remediation</CardTitle>
          <CardDescription>
            Prioritized fixes aggregated from all reports ({groups.length} categories).
          </CardDescription>
        </div>

        {availableSeverities.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            <FilterButton
              active={severityFilter === 'All'}
              onClick={() => setSeverityFilter('All')}
            >
              All
            </FilterButton>
            {availableSeverities.map((severity) => (
              <FilterButton
                key={severity}
                active={severityFilter === severity}
                onClick={() => setSeverityFilter(severity)}
              >
                {severity}
              </FilterButton>
            ))}
          </div>
        ) : null}
      </CardHeader>

      <CardContent>
        <Accordion type="single" collapsible className="space-y-2">
          {visibleGroups.map((group) => (
            <AccordionItem
              key={group.key}
              value={group.key}
              className="border-border bg-card border"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left">
                  <Badge
                    className={cn(
                      'border-transparent text-[10px] font-semibold',
                      severityStyles[group.severity].badge
                    )}
                  >
                    {group.severity}
                  </Badge>
                  <span className="text-sm font-semibold">{group.label}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {group.count} findings
                  </Badge>
                  {group.recommendation ? (
                    <span className="text-muted-foreground hidden truncate text-xs sm:inline">
                      {group.recommendation}
                    </span>
                  ) : null}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                      Recommendation
                    </span>
                    <p className="border-primary bg-primary/5 text-muted-foreground border-l-2 p-2.5 text-sm leading-relaxed">
                      {group.recommendation || 'No recommendation provided.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground mb-1 block text-xs font-semibold tracking-wider uppercase">
                      Appears in
                    </span>
                    <ul className="space-y-1">
                      {group.sources.map((source) => (
                        <li key={source.reportId}>
                          <Link
                            to="/reports/$reportId"
                            params={{ reportId: source.reportId }}
                            className="text-sm font-medium hover:underline"
                          >
                            {source.reportTitle}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? 'default' : 'outline'}
      className="h-7 px-2.5 text-xs"
      onClick={onClick}
    >
      {children}
    </Button>
  )
}
