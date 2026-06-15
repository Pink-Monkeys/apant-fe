import type { ReactNode } from 'react'
import type { AgentLoopData } from '#/features/scanner/dynamic/types'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

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
  const stepsToShow = response?.steps.slice(0, 10) ?? []
  const hasMoreSteps = response ? response.steps.length > stepsToShow.length : false
  const finalAnswerText = response ? toPlainText(response.final_answer) : ''

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
            Vulnerabilities
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-active:bg-primary data-active:text-background"
          >
            Directory
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-active:bg-primary data-active:text-background"
          >
            Settings
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="overview"
          className="border-primary flex flex-col flex-wrap gap-4 border p-4"
        >
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
              <CardContent className="text-muted-foreground text-sm">
                Elapsed time:{' '}
                <span className="text-foreground font-mono font-semibold">
                  {formatDuration(elapsedMs)}
                </span>
              </CardContent>
            </Card>
          ) : null}
          {!isLoading && !response ? (
            <Card>
              <CardHeader>
                <CardTitle>No scan data yet</CardTitle>
                <CardDescription>Submit a dynamic scan to see results.</CardDescription>
              </CardHeader>
            </Card>
          ) : null}
          {response ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Latest scan response</CardTitle>
                <CardDescription>Session {response.session_id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-muted-foreground">Total steps</p>
                    <p className="text-lg font-semibold">{response.total_steps}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Final answer</p>
                    <p className="text-sm whitespace-pre-wrap">{finalAnswerText}</p>
                  </div>
                </div>
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
                    {hasMoreSteps ? (
                      <p className="text-muted-foreground text-sm">
                        Showing first {stepsToShow.length} of {response.steps.length} steps.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          <div className="flex w-full flex-row flex-wrap gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Scan Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">15m 07s</p>
                <p>Total time required for scanning</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">124</p>
                <p>Total requests made to the URL</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Paths Identified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">113</p>
                <p>Total Paths</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Paths Identified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">113</p>
                <p>Total Paths</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex w-full flex-row flex-wrap gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-base">Target Information</CardTitle>
                <CardDescription className="text-sm">
                  Information about Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </CardDescription>
                <CardAction>Card Action</CardAction>
              </CardHeader>
              <hr />
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-destructive">http://ndaru.com</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Server</span>
                    <span>Nginx</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Operating System</span>
                    <span>Linux</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Information Technology</span>
                    <span>PHP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Responsive</span>
                    <span>Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lorem Ipsum</span>
                    <span>Linux</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-base">Activity Process</CardTitle>
                <CardDescription className="text-sm">
                  Activity process Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </CardDescription>
                <CardAction>Card Action</CardAction>
              </CardHeader>
              <hr />
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Address</span>
                    <span className="text-destructive">http://ndaru.com</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Server</span>
                    <span>Nginx</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Operating System</span>
                    <span>Linux</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Information Technology</span>
                    <span>PHP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Responsive</span>
                    <span>Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lorem Ipsum</span>
                    <span>Linux</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p>Card Footer</p>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerabilities</CardTitle>
              <CardDescription>
                Track performance and user engagement metrics. Monitor trends and identify growth
                opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Page views are up 25% compared to last month.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Directory</CardTitle>
              <CardDescription>
                Generate and download your detailed reports. Export data in multiple formats for
                analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              You have 5 reports ready and available to export.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and options. Customize your experience to fit your
                needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Configure notifications, security, and themes.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
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
