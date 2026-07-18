import { useState, type ReactNode } from 'react'
import type { AgentLoopData } from '#/features/scanner/dynamic/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Clock,
  Globe,
  FolderSearch,
  Radio,
  Loader2,
  CheckCircle,
  WifiOff,
  Server,
  Cpu,
  Network,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '#/lib/utils'
import { ScanLiveLog } from '#/features/scanner/components/scan-live-log'
import { ExpandableText } from '#/components/expandable-text'

const STEPS_PER_PAGE = 10
const CRAWL_TOOLS = ['katana_crawl', 'gau_urls', 'waybackurls_fetch']

type DynamicScannerProcessProps = {
  response?: AgentLoopData | null
  isLoading?: boolean
  elapsedMs?: number
}

export default function DynamicScannerProcess({
  response,
  isLoading,
  elapsedMs = 0,
}: DynamicScannerProcessProps) {
  // Client-side pagination over the full steps array (10 per page).
  const [stepPage, setStepPage] = useState(0)
  const allSteps = response?.steps ?? []
  const stepPageCount = Math.max(1, Math.ceil(allSteps.length / STEPS_PER_PAGE))
  const currentStepPage = Math.min(stepPage, stepPageCount - 1)
  const stepStart = currentStepPage * STEPS_PER_PAGE
  const stepsToShow = allSteps.slice(stepStart, stepStart + STEPS_PER_PAGE)

  const finalAnswerText = response ? toPlainText(response.final_answer) : ''

  // Derived stats from steps
  const httpRequestCount = response
    ? response.steps.filter((s) => s.tool === 'http_request').length
    : null

  // URLs discovered by any crawl/enumeration tool, merged and de-duplicated.
  const crawledUrls = response ? extractCrawledUrls(response.steps) : []
  const crawledCount = response ? crawledUrls.length : null

  // Tool usage activity: count by tool name
  const toolUsage: Record<string, number> = {}
  response?.steps.forEach((s) => {
    toolUsage[s.tool] = (toolUsage[s.tool] ?? 0) + 1
  })

  // Target info from response
  const targetInfo = response?.target_info ?? null

  // Status colour helper
  const isTargetUp = targetInfo?.status?.toLowerCase() === 'up'

  return (
    <div>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="border-primary border">
          <TabsTrigger
            value="overview"
            className="data-active:bg-primary data-active:text-background"
          >
            Scan Information
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-active:bg-primary data-active:text-background"
          >
            Agent Steps
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-active:bg-primary data-active:text-background"
          >
            Directory
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent
          value="overview"
          className="border-primary flex flex-col flex-wrap gap-4 border p-4"
        >
          {/* Loading state */}
          {isLoading ? (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="text-primary size-4 animate-spin" />
                  Scan in progress
                </CardTitle>
                <CardDescription>
                  The agent is scanning the target. This may take several minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="text-muted-foreground">
                  Elapsed time:{' '}
                  <span className="text-foreground font-mono font-semibold">
                    {formatDuration(elapsedMs)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Live activity</p>
                  <ScanLiveLog steps={response?.steps ?? []} isRunning />
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Empty state */}
          {!isLoading && !response ? (
            <Card>
              <CardHeader>
                <CardTitle>No scan data yet</CardTitle>
                <CardDescription>Submit a dynamic scan to see results.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}

          {/* Scan summary + steps */}
          {response ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest scan response</CardTitle>
                <CardDescription>
                  Session <span className="font-mono font-semibold">{response.session_id}</span>
                  {response.scan_id ? (
                    <>
                      {' '}
                      &bull; Scan ID{' '}
                      <span className="font-mono text-xs font-semibold">
                        {response.scan_id.slice(0, 8).toUpperCase()}
                      </span>
                    </>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground">Total steps</p>
                  <p className="text-lg font-semibold">{response.total_steps}</p>
                </div>
                {finalAnswerText ? (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">Final answer</p>
                    <ExpandableText text={finalAnswerText} />
                  </div>
                ) : null}
                {stepsToShow.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recent steps</p>
                    <Accordion type="single" collapsible>
                      {stepsToShow.map((step) => (
                        <AccordionItem
                          key={`${response.session_id}-${step.step}`}
                          value={`${step.step}`}
                        >
                          <AccordionTrigger>
                            <div className="flex w-full flex-wrap items-center gap-2 text-sm">
                              <span className="font-medium">Step {step.step}</span>
                              <span className="text-muted-foreground">{step.tool}</span>
                              {step.summary ? (
                                <span className="text-muted-foreground">{step.summary}</span>
                              ) : null}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 text-sm">
                              <div>
                                <p className="text-muted-foreground font-medium">Params</p>
                                <div className="space-y-1">{renderKeyValues(step.params)}</div>
                              </div>
                              <div>
                                <p className="text-muted-foreground font-medium">Result</p>
                                <div className="space-y-1">{renderKeyValues(step.result)}</div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    {allSteps.length > STEPS_PER_PAGE ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <p className="text-muted-foreground text-xs">
                          Menampilkan {stepStart + 1}–{stepStart + stepsToShow.length} dari{' '}
                          {allSteps.length} langkah
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentStepPage === 0}
                            onClick={() => setStepPage((page) => Math.max(0, page - 1))}
                          >
                            <ChevronLeft className="size-3.5" />
                            Prev
                          </Button>
                          <span className="text-muted-foreground text-xs tabular-nums">
                            {currentStepPage + 1} / {stepPageCount}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={currentStepPage >= stepPageCount - 1}
                            onClick={() =>
                              setStepPage((page) => Math.min(stepPageCount - 1, page + 1))
                            }
                          >
                            Next
                            <ChevronRight className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {/* 4 Summary stat cards */}
          <div className="flex w-full flex-row flex-wrap gap-4">
            {/* Scan Duration */}
            <Card className="border-primary min-w-35 flex-1 border">
              <CardHeader className="pb-0">
                <div className="text-muted-foreground flex items-center justify-between">
                  <CardTitle className="text-xs tracking-wide uppercase">Scan Duration</CardTitle>
                  <Clock className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-bold">{formatDuration(elapsedMs)}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {isLoading ? 'In progress…' : response ? 'Total elapsed time' : '-'}
                </p>
              </CardContent>
            </Card>

            {/* HTTP Requests */}
            <Card className="border-primary min-w-35 flex-1 border">
              <CardHeader className="pb-0">
                <div className="text-muted-foreground flex items-center justify-between">
                  <CardTitle className="text-xs tracking-wide uppercase">Requests</CardTitle>
                  <Radio className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-bold">
                  {httpRequestCount !== null ? httpRequestCount : '-'}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">HTTP requests made by agent</p>
              </CardContent>
            </Card>

            {/* Paths/URLs crawled */}
            <Card className="border-primary min-w-35 flex-1 border">
              <CardHeader className="pb-0">
                <div className="text-muted-foreground flex items-center justify-between">
                  <CardTitle className="text-xs tracking-wide uppercase">URLs Crawled</CardTitle>
                  <FolderSearch className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-bold">
                  {crawledCount !== null ? crawledCount : '-'}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">Paths discovered by crawler</p>
              </CardContent>
            </Card>

            {/* Target status */}
            <Card className="border-primary min-w-35 flex-1 border">
              <CardHeader className="pb-0">
                <div className="text-muted-foreground flex items-center justify-between">
                  <CardTitle className="text-xs tracking-wide uppercase">Target Status</CardTitle>
                  <Globe className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                {targetInfo ? (
                  <>
                    <div className="mt-1 flex items-center gap-2">
                      {isTargetUp ? (
                        <CheckCircle className="size-5 shrink-0 text-green-500" />
                      ) : (
                        <WifiOff className="text-destructive size-5 shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-2xl font-bold',
                          isTargetUp ? 'text-green-500' : 'text-destructive'
                        )}
                      >
                        {targetInfo.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-xs">
                      HTTP {targetInfo.status_code}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground text-2xl font-bold">—</p>
                    <p className="text-muted-foreground mt-1 text-xs">No data yet</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Target Info + Tool Activity */}
          <div className="flex w-full flex-row flex-wrap gap-4">
            {/* Target Information */}
            <Card className="border-primary min-w-65 flex-1 border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Server className="text-primary size-4" />
                  <CardTitle className="text-base">Target Information</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Reconnaissance data collected at the start of the scan.
                </CardDescription>
              </CardHeader>
              <hr />
              <CardContent className="pt-3">
                {targetInfo ? (
                  <div className="space-y-2">
                    <InfoRow label="Address" value={targetInfo.address} mono />
                    <InfoRow label="IP Address" value={targetInfo.ip} mono />
                    <InfoRow label="Status" value={targetInfo.status} />
                    <InfoRow label="HTTP Code" value={String(targetInfo.status_code)} mono />
                    <InfoRow label="Web Server" value={targetInfo.server || 'Unknown'} />
                    <InfoRow label="CDN" value={targetInfo.cdn?.toUpperCase() || 'None'} />
                    <InfoRow label="Operating System" value={targetInfo.operating_system} />
                    <InfoRow label="Page Title" value={targetInfo.title} />
                    {targetInfo.technologies && targetInfo.technologies.length > 0 ? (
                      <div className="border-border/60 space-y-1.5 border-t pt-2">
                        <span className="text-muted-foreground text-xs">Technologies</span>
                        <div className="flex flex-wrap gap-1.5">
                          {targetInfo.technologies.map((tech) => (
                            <Badge
                              key={tech}
                              variant="secondary"
                              className="text-[10px] font-medium"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No target information available. Run a scan to populate this panel.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tool Activity */}
            <Card className="border-primary min-w-65 flex-1 border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-primary size-4" />
                  <CardTitle className="text-base">Tool Activity</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Breakdown of tools invoked by the AI agent during this scan.
                </CardDescription>
              </CardHeader>
              <hr />
              <CardContent className="pt-3">
                {response && Object.keys(toolUsage).length > 0 ? (
                  <div className="space-y-2.5">
                    {Object.entries(toolUsage).map(([tool, count]) => (
                      <div key={tool} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Cpu className="text-muted-foreground size-3.5 shrink-0" />
                          <span className="font-mono text-xs font-medium">{tool}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-primary text-primary font-mono text-[10px]"
                        >
                          {count}×
                        </Badge>
                      </div>
                    ))}
                    <div className="border-border text-muted-foreground mt-3 flex items-center gap-2 border-t pt-3 text-xs">
                      <Network className="size-3.5 shrink-0" />
                      {response.total_steps} total steps executed
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No tool activity recorded. Run a scan to see which tools the agent used.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Agent Steps Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Agent Steps</CardTitle>
              <CardDescription>
                Full execution trace of every tool invocation during this scan session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {response && response.steps.length > 0 ? (
                <Accordion type="multiple">
                  {response.steps.map((step) => (
                    <AccordionItem
                      key={`full-${response.session_id}-${step.step}`}
                      value={`${step.step}`}
                    >
                      <AccordionTrigger>
                        <div className="flex w-full flex-wrap items-center gap-2 text-sm">
                          <span className="text-primary font-mono font-bold">#{step.step}</span>
                          <span className="font-medium">{step.tool}</span>
                          {step.summary ? (
                            <span className="text-muted-foreground text-xs">{step.summary}</span>
                          ) : null}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1 font-medium">Params</p>
                            <div className="bg-muted/30 space-y-1 border p-2">
                              {renderKeyValues(step.params)}
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1 font-medium">Result</p>
                            <div className="bg-muted/30 space-y-1 border p-2">
                              {renderKeyValues(step.result)}
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-muted-foreground text-sm">
                  No steps recorded yet. Submit a scan to see the full execution trace.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Directory Tab*/}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>URLs Crawled</CardTitle>
              <CardDescription>
                Paths discovered by the crawler and URL enumeration tools during reconnaissance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {crawledUrls.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Total URLs found:</span>
                    <span className="font-mono font-bold">{crawledUrls.length}</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto border">
                    {crawledUrls.map((url) => (
                      <div
                        key={url}
                        className="hover:bg-muted/30 border-b px-3 py-1.5 font-mono text-xs break-all transition-colors last:border-b-0"
                      >
                        {url}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Belum ada URL hasil crawl.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Sub-components

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={cn('text-right break-all', mono && 'font-mono text-xs')} title={value}>
        {value || '-'}
      </span>
    </div>
  )
}

// Utility helpers

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

// Merges the `result.output` URL lists of every crawl/enumeration step and
// de-duplicates them, preserving first-seen order.
function extractCrawledUrls(steps: AgentLoopData['steps']): string[] {
  const urls = new Set<string>()
  for (const step of steps) {
    if (!CRAWL_TOOLS.includes(step.tool)) continue
    const output = step.result['output']
    if (!Array.isArray(output)) continue
    for (const entry of output) {
      if (typeof entry === 'string' && entry.trim() !== '') {
        urls.add(entry)
      }
    }
  }
  return Array.from(urls)
}

function toPlainText(value: string): string {
  return value
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^#+\s?/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function renderKeyValues(data: Record<string, unknown>): ReactNode {
  return Object.entries(data).map(([key, value]) => (
    <div key={key} className="flex flex-wrap items-start justify-between gap-2">
      <span className="text-muted-foreground">{formatLabel(key)}</span>
      <span className="text-right">{formatValue(value)}</span>
    </div>
  ))
}

function formatLabel(label: string): string {
  return label.replace(/_/g, ' ')
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    const preview = value
      .slice(0, 2)
      .map((item) => formatValue(item))
      .join(', ')
    return value.length > 2
      ? `${preview}, +${value.length - 2} more`
      : preview || `${value.length} items`
  }

  return 'Nested data'
}
