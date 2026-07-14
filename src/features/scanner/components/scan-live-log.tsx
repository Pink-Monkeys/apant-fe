import { useEffect, useRef } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import type { AgentLoopStep } from '#/features/scanner/dynamic/types'
import { cn } from '#/lib/utils'

type ScanLiveLogProps = {
  steps: AgentLoopStep[]
  isRunning: boolean
  className?: string
}

// Distance (px) from the bottom within which we treat the user as "following"
// the log and keep auto-scrolling. Beyond it we assume they scrolled up to read
// older steps and leave their position alone.
const NEAR_BOTTOM_THRESHOLD = 48

// Live step-by-step log rendered while a scan is running. Reads steps straight
// from the polled scan result (no local copy), so a refresh mid-scan restores
// every step so far once polling resumes. Shared by the dynamic and static
// scanner process views.
export function ScanLiveLog({ steps, isRunning, className }: ScanLiveLogProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sortedSteps = [...steps].sort((a, b) => a.step - b.step)

  // Auto-scroll to the newest row when steps arrive, unless the user has
  // scrolled up to read earlier steps.
  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    if (distanceFromBottom <= NEAR_BOTTOM_THRESHOLD) {
      container.scrollTop = container.scrollHeight
    }
  }, [sortedSteps.length])

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-muted/30 border-border/50 max-h-64 space-y-1.5 overflow-y-auto border p-3 font-mono text-xs',
        className
      )}
    >
      {sortedSteps.length === 0 && !isRunning ? (
        <p className="text-muted-foreground">Waiting for scan activity…</p>
      ) : null}

      {sortedSteps.length === 0 && isRunning ? (
        <p className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="text-primary size-3.5 animate-spin" />
          Initializing scan…
        </p>
      ) : null}

      {sortedSteps.map((step) => (
        <div key={step.step} className="flex items-start gap-2">
          <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-green-500" />
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-primary font-bold">#{step.step}</span>
            <span className="font-medium">{step.tool}</span>
            {step.summary ? <span className="text-muted-foreground">{step.summary}</span> : null}
          </div>
        </div>
      ))}

      {sortedSteps.length > 0 && isRunning ? (
        <div className="text-muted-foreground flex items-center gap-2">
          <Loader2 className="text-primary size-3.5 animate-spin" />
          Running next step…
        </div>
      ) : null}
    </div>
  )
}
