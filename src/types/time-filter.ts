import { z } from 'zod'

export const TIME_RANGE_VALUES = ['today', '7d', '30d', 'this_week', 'this_month'] as const
export type TimeRangeValue = (typeof TIME_RANGE_VALUES)[number]

export const timeRangeSearchSchema = z.object({
  range: z.enum(TIME_RANGE_VALUES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})
export type TimeRangeSearch = z.infer<typeof timeRangeSearchSchema>

// Appends range/from/to onto an existing URLSearchParams. Explicit from/to wins
// over range when both are present, matching the backend's precedence rule.
export function appendTimeRangeParams(params: URLSearchParams, filter: TimeRangeSearch): void {
  if (filter.from || filter.to) {
    if (filter.from) params.set('from', filter.from)
    if (filter.to) params.set('to', filter.to)
    return
  }
  if (filter.range) {
    params.set('range', filter.range)
  }
}
