import { useState } from 'react'
import { useTheme } from 'next-themes'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts'
import { Maximize2 } from 'lucide-react'

import { dashboardQueryKeys, getTopCategories } from '#/features/dashboard/api/dashboard-api'
import { topCategoriesConfig } from '#/components/dashboard/charts/chart-constants'
import type { TopCategoryDatum } from '#/components/dashboard/charts/chart-data'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '#/components/ui/chart'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '#/components/ui/drawer'
import { cn } from '#/lib/utils'
import {
  colorForCategory,
  severityBandLegend,
  type CategoryColorMode,
} from '#/components/dashboard/charts/category-severity-colors'
import type { TimeRangeSearch } from '#/types/time-filter'

const MAX_LINE_CHARS = 16

function truncate(label: string, max: number): string {
  return label.length > max ? `${label.slice(0, max - 1)}…` : label
}

// Splits a label into two balanced lines on word boundaries so long category
// names wrap instead of overflowing or being dropped by Recharts.
function splitIntoTwoLines(label: string): [string, string] {
  const trimmed = label.trim()
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length <= 1) {
    return [truncate(trimmed, MAX_LINE_CHARS), '']
  }

  const half = trimmed.length / 2
  let firstLine = ''
  let index = 0
  while (index < words.length) {
    const candidate = firstLine ? `${firstLine} ${words[index]}` : words[index]
    if (firstLine && candidate.length > half) break
    firstLine = candidate
    index++
  }

  return [
    truncate(firstLine, MAX_LINE_CHARS),
    truncate(words.slice(index).join(' '), MAX_LINE_CHARS),
  ]
}

type CategoryTickProps = {
  x?: number
  y?: number
  payload?: { value?: string | number }
}

function CategoryTick({ x = 0, y = 0, payload }: CategoryTickProps) {
  const [firstLine, secondLine] = splitIntoTwoLines(String(payload?.value ?? ''))
  return (
    <text x={x} y={y} textAnchor="middle" className="fill-foreground text-[10px]">
      <tspan x={x} dy={10}>
        {firstLine}
      </tspan>
      {secondLine ? (
        <tspan x={x} dy={11}>
          {secondLine}
        </tspan>
      ) : null}
    </text>
  )
}

function CategoriesEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-1 text-center', className)}>
      <p className="text-sm">No vulnerability categories yet</p>
      <p className="text-xs">Run a scan to populate this chart.</p>
    </div>
  )
}

// Legend for the two-dimensional color scheme: hue = severity band (violet =
// Critical … blue = Low), and within each band a darker shade means a higher
// avg CVSS. It doubles as the secondary encoding that makes the hues readable
// under color-vision deficiency (violet↔blue are close under deuteranopia).
function SeverityBandLegend({ mode, className }: { mode: CategoryColorMode; className?: string }) {
  const bands = severityBandLegend(mode)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {bands.map((band) => (
          <div key={band.label} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[2px]" style={{ backgroundColor: band.color }} />
            <span className="text-[10px] font-medium">
              {band.label} <span className="font-normal">CVSS {band.range}</span>
            </span>
          </div>
        ))}
      </div>
      <span className="text-[9px] leading-tight">
        Darker shade within a color = higher average CVSS.
      </span>
    </div>
  )
}

// Compact vertical bar chart for the dashboard card. Category labels sit on the
// X axis and wrap onto two lines when long. Bar color encodes avg_cvss via the
// hybrid band-hue + shade scheme, independent of sort order/position.
function CategoriesBarChart({
  data,
  mode,
  className,
}: {
  data: TopCategoryDatum[]
  mode: 'light' | 'dark'
  className?: string
}) {
  return (
    <ChartContainer
      className={cn('aspect-auto h-56 w-full', className)}
      config={topCategoriesConfig}
    >
      <BarChart data={data} margin={{ top: 16, left: 8, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="category"
          axisLine={false}
          tickLine={false}
          interval={0}
          height={40}
          tick={<CategoryTick />}
        />
        <YAxis axisLine={false} tickLine={false} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelKey="category"
              hideIndicator
              formatter={(value, _name, item) => {
                const avgCvss = (item?.payload as TopCategoryDatum | undefined)?.avgCvss ?? 0
                return (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span>Findings</span>
                    <span className="font-mono font-medium tabular-nums">{value}</span>
                    {avgCvss > 0 && (
                      <span className="font-mono text-[11px] tabular-nums">
                        avg CVSS {avgCvss.toFixed(1)}
                      </span>
                    )}
                  </div>
                )
              }}
            />
          }
        />
        <Bar dataKey="value" radius={6}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={colorForCategory(entry.avgCvss, mode)} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            className="fill-white text-[10px] font-medium"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

// Fixed vertical space per bar so many categories stay readable; the container
// scrolls instead of squashing them.
const HORIZONTAL_ROW_HEIGHT = 34

// Horizontal bar chart for the fullscreen drawer: category names run along the Y
// axis (upright, no rotation) so even long names never collide.
function CategoriesBarChartHorizontal({
  data,
  mode,
}: {
  data: TopCategoryDatum[]
  mode: 'light' | 'dark'
}) {
  return (
    <ChartContainer
      className="aspect-auto w-full"
      config={topCategoriesConfig}
      style={{ height: Math.max(data.length * HORIZONTAL_ROW_HEIGHT, HORIZONTAL_ROW_HEIGHT * 4) }}
    >
      <BarChart data={data} layout="vertical" margin={{ top: 8, left: 8, right: 32, bottom: 8 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" axisLine={false} tickLine={false} />
        <YAxis
          dataKey="category"
          type="category"
          axisLine={false}
          tickLine={false}
          interval={0}
          width={240}
          tickFormatter={(value: string) => truncate(String(value).trim(), 40)}
          // ChartContainer forces axis ticks to fill-muted-foreground; override it
          // on the tick text itself so category names stay legible in dark mode.
          className="[&_.recharts-cartesian-axis-tick_text]:fill-foreground text-[11px]"
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelKey="category" hideIndicator />}
        />
        <Bar dataKey="value" radius={6}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={colorForCategory(entry.avgCvss, mode)} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            className="fill-foreground text-[11px] font-medium"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

function TopCategoriesChart({
  data,
  filter,
}: {
  data: TopCategoryDatum[]
  filter: TimeRangeSearch
}) {
  const { resolvedTheme } = useTheme()
  const mode = resolvedTheme === 'dark' ? 'dark' : 'light'
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Fetch the full category list only when the drawer is actually opened.
  const allCategoriesQuery = useQuery({
    queryKey: dashboardQueryKeys.topCategories(filter, 0),
    queryFn: () => getTopCategories(filter, 0),
    enabled: drawerOpen,
  })
  const fullData: TopCategoryDatum[] = drawerOpen
    ? (allCategoriesQuery.data ?? []).map((item) => ({
        category: item.category,
        value: item.count,
        avgCvss: item.avg_cvss,
      }))
    : data

  return (
    <Card className="border-chart-1 h-full w-full border">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>
            Showing the Most Frequently Appearing Vulnerability Categories
          </CardDescription>
        </div>
        <Drawer direction="bottom" onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              disabled={data.length === 0}
            >
              <Maximize2 />
              <span className="sr-only">Show all categories</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-screen max-h-screen">
            <DrawerHeader className="text-left">
              <DrawerTitle>Top Categories - All categories</DrawerTitle>
              <DrawerDescription className="text-white">
                Every vulnerability category found, ranked by frequency. Bar color reflects average
                CVSS severity (calm to dark violet as danger increases).
              </DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
              {allCategoriesQuery.isLoading ? (
                <div className="flex h-full items-center justify-center text-sm">
                  Loading all categories...
                </div>
              ) : fullData.length === 0 ? (
                <CategoriesEmptyState className="h-full" />
              ) : (
                <>
                  <SeverityBandLegend mode={mode} className="mb-3 max-w-md" />
                  <CategoriesBarChartHorizontal data={fullData} mode={mode} />
                </>
              )}
            </div>
            <DrawerFooter className="flex-row justify-end">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <CategoriesEmptyState className="h-56" />
        ) : (
          <>
            <CategoriesBarChart data={data} mode={mode} />
            <SeverityBandLegend mode={mode} />
          </>
        )}
      </CardContent>
    </Card>
  )
}

export { TopCategoriesChart }
