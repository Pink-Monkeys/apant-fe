import type { CostInfo } from '#/features/scanner/list/types'

// Formats a cost amount with enough precision for tiny sums: agentic scans often
// cost fractions of a cent, so a flat 2 decimals would render $0.0038 as $0.00.
export function formatCostAmount(amount: number, currency = 'USD'): string {
  const sym = currency === 'USD' ? '$' : ''
  const suffix = sym ? '' : ` ${currency}`
  const digits = amount !== 0 && Math.abs(amount) < 0.01 ? 6 : Math.abs(amount) < 1 ? 4 : 2
  return `${sym}${amount.toFixed(digits)}${suffix}`
}

export type CostDisplay = { text: string; muted: boolean; title: string }

// Renders a scan's derived cost for display, handling every cost state and the
// free (computed 0) case. `muted` marks states where no real amount exists, so
// callers can render them subdued.
export function describeCost(cost?: CostInfo): CostDisplay {
  if (!cost) return { text: '—', muted: true, title: 'No cost information' }
  switch (cost.state) {
    case 'computed': {
      const amount = cost.amount ?? 0
      if (amount === 0) return { text: 'Free', muted: false, title: 'Free model (price 0)' }
      return {
        text: formatCostAmount(amount, cost.currency),
        muted: false,
        title: 'Estimated cost = frozen price × tokens',
      }
    }
    case 'unpriced':
      return {
        text: 'No price',
        muted: true,
        title: 'Model had no price configured at scan start — cost is unknowable for this run',
      }
    case 'no_usage':
      return { text: 'No usage', muted: true, title: 'Provider reported no token usage' }
    case 'no_calls':
      return { text: '—', muted: true, title: 'Scan made no model calls' }
    default:
      return { text: '—', muted: true, title: '' }
  }
}
