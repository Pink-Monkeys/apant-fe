import type { Report } from '#/features/reports/types'

// Generates the report PDF client-side and triggers a download. Shared by the
// report detail page and the /reports Actions menu so both produce an identical
// file. @react-pdf/renderer + the document component are imported lazily to keep
// them out of the initial route bundle.
export async function downloadReportPdf(report: Report): Promise<void> {
  const [{ pdf }, { ReportDocument }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('#/features/reports/components/report-pdf'),
  ])

  const blob = await pdf(<ReportDocument report={report} />).toBlob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `report-${report.id}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
