// Helpers for the custom date-range filter. The backend's business timezone is
// Asia/Jakarta (a fixed UTC+7 offset, no DST), so a calendar date the user picks
// is interpreted as a Jakarta day. We convert those day boundaries to absolute
// UTC instants (RFC3339) before sending them as `from`/`to`.

const JAKARTA_OFFSET = '+07:00'
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000

// Drops the millisecond component so the value matches the RFC3339 examples the
// backend documents (e.g. 2026-07-01T00:00:00Z).
function toRfc3339(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

// Start of the given Jakarta calendar day (00:00:00) as a UTC RFC3339 string.
export function jakartaDayStartUtc(date: string): string {
  return toRfc3339(new Date(`${date}T00:00:00.000${JAKARTA_OFFSET}`))
}

// End of the given Jakarta calendar day (23:59:59) as a UTC RFC3339 string.
export function jakartaDayEndUtc(date: string): string {
  return toRfc3339(new Date(`${date}T23:59:59.000${JAKARTA_OFFSET}`))
}

// Converts a stored UTC RFC3339 instant back to its Jakarta calendar date
// (YYYY-MM-DD) so it can pre-fill a native date input. Returns '' when invalid.
export function utcToJakartaDate(iso: string | undefined): string {
  if (!iso) return ''
  const ms = new Date(iso).getTime()
  if (Number.isNaN(ms)) return ''
  return new Date(ms + JAKARTA_OFFSET_MS).toISOString().slice(0, 10)
}

// True when `date` is a parseable YYYY-MM-DD value.
export function isValidDateInput(date: string): boolean {
  return date !== '' && !Number.isNaN(new Date(`${date}T00:00:00`).getTime())
}
