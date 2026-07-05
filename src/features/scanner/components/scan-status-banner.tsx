import { Ban, CheckCircle, Loader2, WifiOff } from 'lucide-react'
import type { ScanStatus } from '#/features/scanner/list/types'

// Small status line shown above the scan process view. Shared by the dynamic and
// static scanners so both report progress consistently.
export function ScanStatusBanner({ status, error }: { status: ScanStatus; error?: string }) {
  if (status === 'running') {
    return (
      <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
        <Loader2 className="text-primary size-4 animate-spin" />
        <span>
          Scan status: <span className="text-foreground font-medium">Running</span>
        </span>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="mb-4 flex items-center gap-2 text-sm text-green-500">
        <CheckCircle className="size-4" />
        <span>Scan completed</span>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="text-destructive mb-4 flex items-center gap-2 text-sm">
        <WifiOff className="size-4 shrink-0" />
        <span>Scan failed{error ? `: ${error}` : ''}</span>
      </div>
    )
  }

  if (status === 'cancelled') {
    return (
      <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
        <Ban className="size-4" />
        <span>Scan cancelled</span>
      </div>
    )
  }

  return null
}
