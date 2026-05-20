import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts'

import { scanRankingConfig } from '#/components/dashboard/charts/chart-constants'
import { scanRankingData } from '#/components/dashboard/charts/chart-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '#/components/ui/chart'

const scanRankingLegend = scanRankingData.map((item) => ({
  label: item.severity,
  className: item.className.text,
}))

function ScanRankingChart() {
  return (
    <Card className="border-chart-1 h-full w-full border">
      <CardHeader>
        <CardTitle>Scan Results Ranking</CardTitle>
        <CardDescription>Display scan results ranked by severity level</CardDescription>
      </CardHeader>
      <CardContent className="chart space-y-3">
        <ChartContainer className="aspect-auto h-56 w-full" config={scanRankingConfig}>
          <BarChart
            data={scanRankingData}
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
              <LabelList
                dataKey="report"
                position="insideLeft"
                offset={8}
                className="fill-white text-[10px] font-medium"
              />
              {scanRankingData.map((item) => (
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
