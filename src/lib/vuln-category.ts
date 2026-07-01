// Scan-type tokens that legacy reports may carry in `vulnerabilities[].type`.
// They are NOT real vulnerability categories and must never be charted/grouped.
const SCAN_TYPE_TOKENS = new Set(['sast', 'dast'])

// True when `type` is a real vulnerability category: non-empty and not a
// scan-type token. Case-insensitive. Kept generic — new categories from the
// backend pass through without changes here.
export function isRealVulnCategory(type: string | null | undefined): boolean {
  const normalized = type?.trim().toLowerCase()
  if (!normalized) return false
  return !SCAN_TYPE_TOKENS.has(normalized)
}

// Normalizes a raw vuln `type` into a display category, or null when it should
// be excluded (empty/undefined or a scan-type token). Original casing/trim is
// preserved so backend labels render as-is.
export function normalizeVulnCategory(type: string | null | undefined): string | null {
  const trimmed = type?.trim()
  if (!trimmed || !isRealVulnCategory(trimmed)) return null
  return trimmed
}
