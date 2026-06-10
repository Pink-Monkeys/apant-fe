import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'

export default function ReportCard() {
  return (
    <Card className="border-primary border">
      <CardHeader className="pb-0">
        <div className="text-muted-foreground flex items-center justify-between">
          <CardTitle className="text-xs tracking-wide uppercase">A Title</CardTitle>
          Bla bla bla value
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold tracking-tight">Content</p>
        <CardDescription className="mt-1 text-xs">Content</CardDescription>
      </CardContent>
    </Card>
  )
}
