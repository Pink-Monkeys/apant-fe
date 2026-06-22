import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'

import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const activeTheme = theme ?? 'system'

  return (
    <Card className="border-primary max-w-2xl border">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Customize how APANT looks on this device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            const isActive = activeTheme === option.value
            return (
              <Button
                key={option.value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setTheme(option.value)}
              >
                <Icon className="size-4" />
                {option.label}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
