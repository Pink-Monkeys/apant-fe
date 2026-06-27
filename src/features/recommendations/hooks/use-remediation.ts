import { useMemo } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'

import { getReportDetail, getReports, reportsQueryKeys } from '#/features/reports/api/reports-api'
import type { Report } from '#/features/reports/types'
import { severityStyles } from '#/lib/severity'

export type RemediationSeverity = keyof typeof severityStyles

export type RemediationSource = {
  reportId: string
  reportTitle: string
}

export type RemediationGroup = {
  key: string
  label: string
  severity: RemediationSeverity
  count: number
  recommendation: string
  sources: RemediationSource[]
}

export type RemediationData = {
  groups: RemediationGroup[]
  isLoading: boolean
  isError: boolean
  error: Error | null
}

// Worst-case ordering: a higher rank means a more urgent severity.
const SEVERITY_RANK: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  informational: 1,
}

function severityRank(severity: string): number {
  return SEVERITY_RANK[severity.toLowerCase()] ?? 0
}

function toSeverityKey(severity: string): RemediationSeverity {
  const lower = severity.toLowerCase()
  if (!lower) return 'Informational'
  const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1)
  return (capitalized in severityStyles ? capitalized : 'Informational') as RemediationSeverity
}

type GroupAccumulator = {
  label: string
  worstRank: number
  worstSeverity: string
  count: number
  recommendation: string
  recommendationRank: number
  sources: Map<string, string>
}

function buildRemediationGroups(reportDetails: Array<Report | undefined>): RemediationGroup[] {
  const groups = new Map<string, GroupAccumulator>()

  for (const report of reportDetails) {
    if (!report) continue

    for (const vuln of report.vulnerabilities ?? []) {
      const type = vuln.type?.trim()
      if (!type) continue

      const key = type.toLowerCase()
      const rank = severityRank(vuln.severity ?? '')
      const recommendation = vuln.recommendation?.trim() ?? ''

      let group = groups.get(key)
      if (!group) {
        group = {
          label: type,
          worstRank: rank,
          worstSeverity: vuln.severity ?? '',
          count: 0,
          recommendation: '',
          recommendationRank: -1,
          sources: new Map(),
        }
        groups.set(key, group)
      }

      group.count += 1

      if (rank > group.worstRank) {
        group.worstRank = rank
        group.worstSeverity = vuln.severity ?? ''
      }

      // Prefer the recommendation from the highest-severity occurrence; the first
      // non-empty one wins ties (and serves as the fallback).
      if (recommendation && rank > group.recommendationRank) {
        group.recommendation = recommendation
        group.recommendationRank = rank
      }

      if (report.id && !group.sources.has(report.id)) {
        group.sources.set(report.id, report.title ?? report.id)
      }
    }
  }

  const result: RemediationGroup[] = [...groups.values()].map((group) => ({
    key: group.label.toLowerCase(),
    label: group.label,
    severity: toSeverityKey(group.worstSeverity),
    count: group.count,
    recommendation: group.recommendation,
    sources: [...group.sources.entries()].map(([reportId, reportTitle]) => ({
      reportId,
      reportTitle,
    })),
  }))

  // Sort by severity (critical -> informational), then count desc, then label A-Z.
  result.sort((a, b) => {
    const rankDiff = severityRank(b.severity) - severityRank(a.severity)
    if (rankDiff !== 0) return rankDiff
    if (b.count !== a.count) return b.count - a.count
    return a.label.localeCompare(b.label)
  })

  return result
}

export function useRemediation(): RemediationData {
  const reportsQuery = useQuery({ queryKey: reportsQueryKeys.all, queryFn: getReports })
  const reports = reportsQuery.data ?? []

  // Detail carries vulnerabilities[]; the queryKey is shared with the dashboard
  // Top Categories aggregation so the cache is reused (no duplicate requests).
  const detailQueries = useQueries({
    queries: reports.map((report) => ({
      queryKey: reportsQueryKeys.detail(report.id),
      queryFn: () => getReportDetail(report.id),
    })),
  })

  const isLoading = reportsQuery.isLoading || detailQueries.some((query) => query.isLoading)

  // Stable signature so the memo only recomputes when the underlying report data
  // actually changes — not on every render (keeps the rendered array reference
  // stable and avoids re-render storms).
  const detailsSignature = detailQueries
    .map((query) =>
      query.data ? `${query.data.id}:${query.data.vulnerabilities?.length ?? 0}` : ''
    )
    .join('|')

  const groups = useMemo(
    () => buildRemediationGroups(detailQueries.map((query) => query.data)),
    // detailQueries is recreated every render; detailsSignature captures real changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detailsSignature]
  )

  return {
    groups,
    isLoading,
    isError: reportsQuery.isError,
    error: reportsQuery.error,
  }
}
