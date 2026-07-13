import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import type { TimeRangeValue } from '#/types/time-filter'

const TIME_RANGE_OPTIONS: { value: TimeRangeValue | 'all'; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
]

type TimeRangeFilterProps = {
  value: TimeRangeValue | 'all'
  onChange: (value: TimeRangeValue | 'all') => void
  className?: string
}

function TimeRangeFilter({ value, onChange, className }: TimeRangeFilterProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as TimeRangeValue | 'all')}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select time range" />
      </SelectTrigger>
      <SelectContent>
        {TIME_RANGE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { TimeRangeFilter }
