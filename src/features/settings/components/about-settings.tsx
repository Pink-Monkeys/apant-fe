import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'

const APP_VERSION = '1.0.0'

export function AboutSettings() {
  return (
    <Card className="border-primary max-w-2xl border">
      <CardHeader>
        <CardTitle>APANT</CardTitle>
        <CardDescription>AI-assisted web penetration testing platform.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground leading-relaxed">
          APANT runs automated dynamic and static security scans with an AI agent and compiles the
          findings into shareable reports.
        </p>
        <div className="divide-border/50 border-border/50 bg-muted/10 divide-y border text-xs">
          <div className="flex justify-between p-2.5">
            <span className="text-muted-foreground">Version</span>
            <span className="font-mono">{APP_VERSION}</span>
          </div>
          <div className="flex justify-between p-2.5">
            <span className="text-muted-foreground">Team</span>
            <span>Pink Monkeys</span>
          </div>
          <div className="flex justify-between p-2.5">
            <span className="text-muted-foreground">License</span>
            <span>Academic / Final Project</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
