import { severityStyles } from '#/lib/severity'

const scanRankingData = [
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

const topCategoriesData = [
  { category: 'SQLi', value: 21 },
  { category: 'XSS', value: 32 },
  { category: 'CSRF', value: 32 },
  { category: 'BAC', value: 10 },
  { category: 'IDOR', value: 23 },
]

export { scanRankingData, topCategoriesData }
