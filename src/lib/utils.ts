import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Builds a display-only short id (e.g. "RPT-AB12CD") from the last `len`
// characters of a UUID. Null-safe: returns just the prefix when id is missing.
// The full UUID must still be used for routing, fetching, and lookups.
export function shortId(prefix: string, id?: string, len = 6): string {
  if (!id) return prefix
  return `${prefix}-${id.slice(-len).toUpperCase()}`
}
