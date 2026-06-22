import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'

import { getScans, scanListQueryKeys } from '#/features/scanner/list/api/scan-list-api'
import { getReportDetail, getReports, reportsQueryKeys } from '#/features/reports/api/reports-api'
import type { Report } from '#/features/reports/types'
import type { SessionHistoryRow } from '#/components/dashboard/table/table-columns'
import { shortId } from '#/lib/utils'

function capitalizeSeverity(severity: string): SessionHistoryRow['severity'] {
  if (!severity) return '-'
  return (severity.charAt(0).toUpperCase() + severity.slice(1)) as SessionHistoryRow['severity']
}

type ScanSeverity = { severity: SessionHistoryRow['severity']; createdAt: number }

export function useSessionHistory(): SessionHistoryRow[] {
  const scansQuery = useQuery({ queryKey: scanListQueryKeys.all, queryFn: getScans })
  const reportsQuery = useQuery({ queryKey: reportsQueryKeys.all, queryFn: getReports })

  const reports = reportsQuery.data ?? []

  // Only report DETAIL carries scan_id + overall_severity. Same queryKey as the
  // Top Categories chart, so the cache is shared (no duplicate requests).
  const detailQueries = useQueries({
    queries: reports.map((report) => ({
      queryKey: reportsQueryKeys.detail(report.id),
      queryFn: () => getReportDetail(report.id),
    })),
  })

  const scans = scansQuery.data

  // Stable signature of the detail data so the rows below only recompute when the
  // underlying report data actually changes — not on every render.
  const detailsSignature = detailQueries
    .map((query) =>
      query.data
        ? `${query.data.scan_id ?? ''}:${query.data.overall_severity ?? ''}:${query.data.created_at ?? ''}`
        : ''
    )
    .join('|')

  // Memoize the rows so the `data` passed to the table keeps a STABLE reference.
  // Without this the hook returns a new array every render; when the Actions
  // dropdown opens, Radix's popper re-measures on each render and the table
  // re-renders in a loop -> the page freezes ("Page Unresponsive").
  return useMemo<SessionHistoryRow[]>(() => {
    const reportDetails = detailQueries
      .map((query) => query.data)
      .filter((report): report is Report => Boolean(report))

    // Severity per scan, keeping the newest report when a scan has several.
    const severityByScanId = new Map<string, ScanSeverity>()
    for (const report of reportDetails) {
      if (!report.scan_id) continue
      const createdAt = new Date(report.created_at).getTime()
      const existing = severityByScanId.get(report.scan_id)
      if (!existing || createdAt > existing.createdAt) {
        severityByScanId.set(report.scan_id, {
          severity: capitalizeSeverity(report.overall_severity),
          createdAt,
        })
      }
    }

    return [...(scans ?? [])]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((scan) => ({
        scanId: scan.id,
        reportId: shortId('SCN', scan.id),
        detail: `Scan on Target ${scan.target}`,
        severity: severityByScanId.get(scan.id)?.severity ?? '-',
      }))
    // detailQueries is captured fresh whenever detailsSignature changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scans, detailsSignature])
}
