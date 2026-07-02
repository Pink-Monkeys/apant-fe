import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { Maximize2 } from 'lucide-react'

import {
  topCategoriesConfig,
  topCategoryClasses,
} from '#/components/dashboard/charts/chart-constants'
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
    <text x={x} y={y} textAnchor="middle" className="fill-muted-foreground text-[10px]">
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
      <p className="text-muted-foreground text-sm">No vulnerability categories yet</p>
      <p className="text-muted-foreground text-xs">Run a scan to populate this chart.</p>
    </div>
  )
}

// Compact vertical bar chart for the dashboard card. Category labels sit on the
// X axis and wrap onto two lines when long.
function CategoriesBarChart({ data, className }: { data: TopCategoryDatum[]; className?: string }) {
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
          content={<ChartTooltipContent labelKey="category" hideIndicator />}
        />
        <Bar dataKey="value" className={topCategoryClasses.bar} radius={6}>
          <LabelList
            dataKey="value"
            position="top"
            className="fill-foreground text-[10px] font-medium"
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
function CategoriesBarChartHorizontal({ data }: { data: TopCategoryDatum[] }) {
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
          className="fill-muted-foreground text-[11px]"
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent labelKey="category" hideIndicator />}
        />
        <Bar dataKey="value" className={topCategoryClasses.bar} radius={6}>
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
  allData,
}: {
  data: TopCategoryDatum[]
  allData?: TopCategoryDatum[]
}) {
  // Fall back to the compact data when the full list isn't supplied.
  const fullData = allData ?? data

  return (
    <Card className="border-chart-1 h-full w-full border">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>
            Showing the Most Frequently Appearing Vulnerability Categories
          </CardDescription>
        </div>
        <Drawer direction="bottom">
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground shrink-0"
              disabled={fullData.length === 0}
            >
              <Maximize2 />
              <span className="sr-only">Expand Top Categories to fullscreen</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-screen max-h-screen">
            <DrawerHeader className="text-left">
              <DrawerTitle>Top Categories</DrawerTitle>
              <DrawerDescription>
                Showing the Most Frequently Appearing Vulnerability Categories
              </DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">
              {fullData.length === 0 ? (
                <CategoriesEmptyState className="h-full" />
              ) : (
                <CategoriesBarChartHorizontal data={fullData} />
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
      <CardContent>
        {data.length === 0 ? (
          <CategoriesEmptyState className="h-56" />
        ) : (
          <CategoriesBarChart data={data} />
        )}
      </CardContent>
    </Card>
  )
}

export { TopCategoriesChart }
