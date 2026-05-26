import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

import {
  topCategoriesConfig,
  topCategoryClasses,
} from '#/components/dashboard/charts/chart-constants'
import { topCategoriesData } from '#/components/dashboard/charts/chart-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '#/components/ui/chart'

function TopCategoriesChart() {
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
          <BarChart data={topCategoriesData} margin={{ top: 16, left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="category" axisLine={false} tickLine={false} />
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
