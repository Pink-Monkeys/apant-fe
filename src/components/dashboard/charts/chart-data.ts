import { severityStyles } from '#/lib/severity'

// Shapes shared by the static reference data below and the real data computed in
// useDashboardData; the charts consume these via props.
export type ScanRankingDatum = {
  severity: string
  report: string
  value: number
  className: (typeof severityStyles)[keyof typeof severityStyles]
}

export type TopCategoryDatum = {
  category: string
  value: number
  avgCvss: number
}

const scanRankingData: ScanRankingDatum[] = [
  {
    severity: 'Critical',
    report: '#RPT014',
    value: 48,
    className: severityStyles.Critical,
  },
  {
    severity: 'High',
    report: '#RPT234',
    value: 38,
    className: severityStyles.High,
  },
  {
    severity: 'Medium',
    report: '#RPT865',
    value: 30,
    className: severityStyles.Medium,
  },
  {
    severity: 'Low',
    report: '#RPT122',
    value: 22,
    className: severityStyles.Low,
  },
  {
    severity: 'Informational',
    report: '#RPT211',
    value: 14,
    className: severityStyles.Informational,
  },
]

const topCategoriesData: TopCategoryDatum[] = [
  { category: 'SQLi', value: 21, avgCvss: 8.6 },
  { category: 'XSS', value: 32, avgCvss: 6.2 },
  { category: 'CSRF', value: 32, avgCvss: 5.4 },
  { category: 'BAC', value: 10, avgCvss: 7.1 },
  { category: 'IDOR', value: 23, avgCvss: 6.8 },
]

export { scanRankingData, topCategoriesData }
