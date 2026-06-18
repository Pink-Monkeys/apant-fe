import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import type { Report, ReportSeverity } from '#/features/reports/types'

// @react-pdf uses its own CSS-subset flexbox via StyleSheet (NOT Tailwind).
// Severity colors are defined locally because the PDF renderer needs plain hex
// values, not the Tailwind classes used by the on-screen `severityStyles`.
const SEVERITY_COLORS: Record<ReportSeverity, { bg: string; text: string }> = {
  critical: { bg: '#b71c1c', text: '#ffffff' },
  high: { bg: '#e65100', text: '#ffffff' },
  medium: { bg: '#fbc02d', text: '#1a1a1a' },
  low: { bg: '#2e7d32', text: '#ffffff' },
  informational: { bg: '#607d8b', text: '#ffffff' },
}

function severityColor(severity: ReportSeverity) {
  return SEVERITY_COLORS[severity] ?? SEVERITY_COLORS.informational
}

function titleCase(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function joinList(list: Array<string | number> | null | undefined): string {
  if (!list || list.length === 0) return ''
  return list.join(', ')
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  generatedAt: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 3,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },
  section: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paragraph: {
    fontSize: 9,
    color: '#333333',
    textAlign: 'justify',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 3,
    padding: 8,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  statLabel: {
    fontSize: 7,
    color: '#666666',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableLabel: {
    width: '32%',
    padding: 5,
    fontFamily: 'Helvetica-Bold',
    color: '#555555',
    backgroundColor: '#f7f7f7',
  },
  tableValue: {
    width: '68%',
    padding: 5,
    color: '#333333',
  },
  vulnCard: {
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 3,
    marginBottom: 10,
    padding: 10,
  },
  vulnHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  vulnId: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  verifiedBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#2e7d32',
    color: '#ffffff',
  },
  fieldLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#555555',
    marginTop: 6,
    marginBottom: 2,
  },
  pocBlock: {
    backgroundColor: '#1e1e1e',
    borderRadius: 3,
    padding: 8,
    marginTop: 2,
  },
  pocText: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: '#e0e0e0',
    marginBottom: 2,
  },
  recommendation: {
    borderLeftWidth: 2,
    borderLeftColor: '#2e7d32',
    backgroundColor: '#f1f8f1',
    padding: 6,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 6,
  },
})

function SeverityBadge({ severity }: { severity: ReportSeverity }) {
  const color = severityColor(severity)
  return (
    <Text style={[styles.badge, { backgroundColor: color.bg, color: color.text }]}>
      {titleCase(severity)}
    </Text>
  )
}

type TableRowData = { label: string; value: string }

function InfoTable({ rows }: { rows: TableRowData[] }) {
  const visibleRows = rows.filter((row) => row.value.trim().length > 0)
  if (visibleRows.length === 0) return null
  return (
    <View style={styles.table}>
      {visibleRows.map((row, index) => (
        <View
          key={row.label}
          style={index === visibleRows.length - 1 ? styles.tableRowLast : styles.tableRow}
        >
          <Text style={styles.tableLabel}>{row.label}</Text>
          <Text style={styles.tableValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  )
}

export function ReportDocument({ report }: { report: Report }) {
  const { metadata, target_info, attack_surface, statistics, vulnerabilities } = report
  const bySeverity = statistics?.by_severity
  const criticalHigh = (bySeverity?.critical ?? 0) + (bySeverity?.high ?? 0)

  return (
    <Document
      title={report.title}
      author={`${metadata.provider} / ${metadata.model}`}
      creator="APANT"
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.generatedAt}>Generated: {formatDate(report.created_at)}</Text>
          <Text
            style={[
              styles.badge,
              {
                backgroundColor: severityColor(report.overall_severity).bg,
                color: severityColor(report.overall_severity).text,
              },
            ]}
          >
            Overall Severity: {titleCase(report.overall_severity)}
          </Text>
        </View>

        {/* Executive Summary */}
        {report.executive_summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.paragraph}>{report.executive_summary}</Text>
          </View>
        ) : null}

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statistics?.total_vulnerabilities ?? 0}</Text>
              <Text style={styles.statLabel}>Total Vulnerabilities</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{criticalHigh}</Text>
              <Text style={styles.statLabel}>Critical / High</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{statistics?.exploit_success_count ?? 0}</Text>
              <Text style={styles.statLabel}>Verified Exploits</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{metadata.tools_used?.length ?? 0}</Text>
              <Text style={styles.statLabel}>Tools Used</Text>
            </View>
          </View>
        </View>

        {/* Target Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Target Information</Text>
          <InfoTable
            rows={[
              { label: 'Target', value: metadata.target ?? '' },
              {
                label: 'Scan Type',
                value: metadata.scan_type ? titleCase(metadata.scan_type) : '',
              },
              { label: 'Description', value: metadata.description ?? '' },
              {
                label: 'Status',
                value: target_info
                  ? `${target_info.status_code ?? ''} ${target_info.status ?? ''}`.trim()
                  : '',
              },
              { label: 'IP Address', value: target_info?.ip_address ?? '' },
              { label: 'Web Server', value: target_info?.web_server ?? '' },
              { label: 'Operating System', value: target_info?.operating_system ?? '' },
              { label: 'CDN', value: target_info?.cdn ?? '' },
              { label: 'Page Title', value: target_info?.page_title ?? '' },
              { label: 'Tech Stack', value: joinList(target_info?.tech_stack) },
              { label: 'Open Ports', value: joinList(target_info?.open_ports) },
              {
                label: 'Scan Date',
                value: metadata.scan_date ? formatDate(metadata.scan_date) : '',
              },
              { label: 'Duration', value: metadata.duration ?? '' },
              {
                label: 'Provider / Model',
                value: `${metadata.provider ?? ''} / ${metadata.model ?? ''}`.replace(/^ \/ $/, ''),
              },
              { label: 'Tools Used', value: joinList(metadata.tools_used) },
            ]}
          />
        </View>

        {/* Attack Surface */}
        {attack_surface ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attack Surface</Text>
            <InfoTable
              rows={[
                { label: 'Subdomains Found', value: String(attack_surface.subdomains_found) },
                { label: 'URLs Crawled', value: String(attack_surface.urls_crawled) },
                {
                  label: 'Parameterized Endpoints',
                  value: String(attack_surface.parameterized_endpoints),
                },
                { label: 'Open Ports Count', value: String(attack_surface.open_ports_count) },
              ]}
            />
          </View>
        ) : null}

        {/* Vulnerabilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Vulnerabilities ({statistics?.total_vulnerabilities ?? vulnerabilities?.length ?? 0})
          </Text>
          {!vulnerabilities || vulnerabilities.length === 0 ? (
            <Text style={styles.paragraph}>No vulnerabilities were identified on the target.</Text>
          ) : (
            vulnerabilities.map((vuln) => (
              <View key={vuln.id} style={styles.vulnCard} wrap={false}>
                <View style={styles.vulnHeader}>
                  <Text style={styles.vulnId}>
                    {vuln.id} - {vuln.title}
                  </Text>
                  <SeverityBadge severity={vuln.severity} />
                  {vuln.verified ? <Text style={styles.verifiedBadge}>VERIFIED</Text> : null}
                </View>

                <InfoTable
                  rows={[
                    { label: 'Type', value: vuln.type ?? '' },
                    { label: 'Location', value: vuln.location ?? '' },
                    {
                      label: 'CVSS Score',
                      value: typeof vuln.cvss_score === 'number' ? String(vuln.cvss_score) : '',
                    },
                  ]}
                />

                {vuln.description ? (
                  <>
                    <Text style={styles.fieldLabel}>Description</Text>
                    <Text style={styles.paragraph}>{vuln.description}</Text>
                  </>
                ) : null}

                {vuln.impact ? (
                  <>
                    <Text style={styles.fieldLabel}>Impact</Text>
                    <Text style={styles.paragraph}>{vuln.impact}</Text>
                  </>
                ) : null}

                {vuln.poc ? (
                  <>
                    <Text style={styles.fieldLabel}>Proof of Concept</Text>
                    <View style={styles.pocBlock}>
                      <Text style={styles.pocText}>
                        {vuln.poc.method} {vuln.poc.url}
                      </Text>
                      {vuln.poc.payload ? (
                        <Text style={styles.pocText}>Payload: {vuln.poc.payload}</Text>
                      ) : null}
                      {vuln.poc.curl_cmd ? (
                        <Text style={styles.pocText}>$ {vuln.poc.curl_cmd}</Text>
                      ) : null}
                    </View>
                  </>
                ) : null}

                {vuln.recommendation ? (
                  <>
                    <Text style={styles.fieldLabel}>Recommendation</Text>
                    <Text style={[styles.paragraph, styles.recommendation]}>
                      {vuln.recommendation}
                    </Text>
                  </>
                ) : null}
              </View>
            ))
          )}
        </View>

        {/* Mitigation */}
        {report.mitigation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mitigation</Text>
            <Text style={styles.paragraph}>{report.mitigation}</Text>
          </View>
        ) : null}

        {/* Conclusion */}
        {report.conclusion ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conclusion</Text>
            <Text style={styles.paragraph}>{report.conclusion}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <Text
          style={styles.footer}
          render={() =>
            `Generated by APANT | Report ID: ${report.id} | ${new Date(report.created_at).getFullYear() || new Date().getFullYear()}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
