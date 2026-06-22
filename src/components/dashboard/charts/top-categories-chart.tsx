import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

import {
  topCategoriesConfig,
  topCategoryClasses,
} from '#/components/dashboard/charts/chart-constants'
import type { TopCategoryDatum } from '#/components/dashboard/charts/chart-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '#/components/ui/chart'

const MAX_LINE_CHARS = 16

function truncate(line: string): string {
  return line.length > MAX_LINE_CHARS ? `${line.slice(0, MAX_LINE_CHARS - 1)}…` : line
}

// Splits a label into two balanced lines on word boundaries so long category
// names wrap instead of overflowing or being dropped by Recharts.
function splitIntoTwoLines(label: string): [string, string] {
  const trimmed = label.trim()
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length <= 1) {
    return [truncate(trimmed), '']
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

  return [truncate(firstLine), truncate(words.slice(index).join(' '))]
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

function TopCategoriesChart({ data }: { data: TopCategoryDatum[] }) {
  return (
    <Card className="border-chart-1 h-full w-full border">
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
        <CardDescription>
          Showing the Most Frequently Appearing Vulnerability Categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer className="aspect-auto h-56 w-full" config={topCategoriesConfig}>
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
      </CardContent>
    </Card>
  )
}

export { TopCategoriesChart }
