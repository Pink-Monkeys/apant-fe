import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Popover, PopoverAnchor, PopoverContent } from '#/components/ui/popover'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  isValidDateInput,
  jakartaDayEndUtc,
  jakartaDayStartUtc,
  utcToJakartaDate,
} from '#/lib/date-range'
import type { TimeRangeValue } from '#/types/time-filter'

const CUSTOM_VALUE = 'custom'

const TIME_RANGE_OPTIONS: { value: TimeRangeValue | 'all' | typeof CUSTOM_VALUE; label: string }[] =
  [
    { value: 'all', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This week' },
    { value: 'this_month', label: 'This month' },
    { value: CUSTOM_VALUE, label: 'Custom range' },
  ]

type TimeRangeFilterProps = {
  range?: TimeRangeValue | 'all'
  from?: string
  to?: string
  onPresetChange: (value: TimeRangeValue | 'all') => void
  onCustomChange: (from: string, to: string) => void
  className?: string
}

function TimeRangeFilter({
  range,
  from,
  to,
  onPresetChange,
  onCustomChange,
  className,
}: TimeRangeFilterProps) {
  const isCustom = Boolean(from || to)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const openPicker = () => {
    setFromDate(utcToJakartaDate(from))
    setToDate(utcToJakartaDate(to))
    setError(null)
    setPickerOpen(true)
  }

  const handleSelectChange = (next: string) => {
    if (next === CUSTOM_VALUE) {
      openPicker()
      return
    }
    onPresetChange(next as TimeRangeValue | 'all')
  }

  const handleApply = () => {
    if (!isValidDateInput(fromDate)) {
      setError('Select a start date.')
      return
    }
    // A single picked date is treated as that whole day.
    const end = toDate || fromDate
    if (!isValidDateInput(end)) {
      setError('End date is invalid.')
      return
    }
    if (end < fromDate) {
      setError('End date cannot be before the start date.')
      return
    }
    onCustomChange(jakartaDayStartUtc(fromDate), jakartaDayEndUtc(end))
    setPickerOpen(false)
  }

  return (
    <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
      <PopoverAnchor asChild>
        <div className="flex items-center gap-2">
          <Select
            value={isCustom ? CUSTOM_VALUE : (range ?? 'all')}
            onValueChange={handleSelectChange}
          >
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
          {isCustom ? (
            <Button type="button" variant="outline" size="sm" onClick={openPicker}>
              Edit
            </Button>
          ) : null}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="end"
        className="w-64"
        // Selecting the "Custom range" item closes the Select, which restores
        // focus to its trigger via an internal timer. Keeping focus on the
        // trigger (not stealing it on open) and ignoring that focus-restore as
        // an outside interaction stops the picker from closing instantly — a
        // deterministic fix, unlike deferring the open with a timer.
        onOpenAutoFocus={(event) => event.preventDefault()}
        onFocusOutside={(event) => event.preventDefault()}
      >
        <div className="flex flex-col gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">Custom range</p>
            <p className="text-muted-foreground text-xs">Pick a single day or a start–end range.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="range-from" className="text-xs">
              From
            </Label>
            <Input
              id="range-from"
              type="date"
              max={toDate || undefined}
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value)
                setError(null)
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="range-to" className="text-xs">
              To <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="range-to"
              type="date"
              min={fromDate || undefined}
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value)
                setError(null)
              }}
            />
          </div>
          {error ? <p className="text-destructive text-xs">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { TimeRangeFilter }
