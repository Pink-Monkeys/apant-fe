import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts'

import { scanRankingConfig } from '#/components/dashboard/charts/chart-constants'
import type { ScanRankingDatum } from '#/components/dashboard/charts/chart-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '#/components/ui/chart'

type ReportBarLabelProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: string | number
}

// Renders the report id inside the bar when it fits, otherwise just to the right
// of the bar so short bars don't bleed white text onto the background.
function ReportBarLabel({ x = 0, y = 0, width = 0, height = 0, value }: ReportBarLabelProps) {
  const text = value == null ? '' : String(value)
  if (!text || text === '-') return null

  const approxTextWidth = text.length * 6.5 + 12
  const centerY = y + height / 2

  if (width >= approxTextWidth) {
    return (
      <text
        x={x + 8}
        y={centerY}
        dominantBaseline="central"
        className="fill-white text-[10px] font-medium"
      >
        {text}
      </text>
    )
  }

  return (
    <text
      x={x + width + 6}
      y={centerY}
      dominantBaseline="central"
      className="fill-foreground text-[10px] font-medium"
    >
      {text}
    </text>
  )
}

function ScanRankingChart({ data }: { data: ScanRankingDatum[] }) {
  const scanRankingLegend = data.map((item) => ({
    label: item.severity,
    className: item.className.text,
  }))

  return (
    <Card className="border-chart-1 h-full w-full border">
      <CardHeader>
        <CardTitle>Scan Results Ranking</CardTitle>
        <CardDescription>Display scan results ranked by severity level</CardDescription>
      </CardHeader>
      <CardContent className="chart space-y-3">
        <ChartContainer className="aspect-auto h-56 w-full" config={scanRankingConfig}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 16 }}
            className="rounded-none"
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="severity"
              type="category"
              axisLine={false}
              tickLine={false}
              width={96}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelKey="severity" hideIndicator />}
            />
            <Bar dataKey="value" radius={6}>
              <LabelList dataKey="report" content={<ReportBarLabel />} />
              {data.map((item) => (
                <Cell key={item.severity} className={item.className.bar} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        <div className="flex flex-wrap gap-3 text-[11px]">
          {scanRankingLegend.map((item) => (
            <span key={item.label} className={`font-medium ${item.className}`}>
              {item.label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { ScanRankingChart }
