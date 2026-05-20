import type { SessionHistoryRow } from '#/components/dashboard/table/table-columns'

const latestSessionHistoryData: SessionHistoryRow[] = [
  {
    reportId: 'RPT113',
    detail: "[Critical] - SQL Injection on /user/login parameter 'username'",
    severity: 'Critical',
  },
  {
    reportId: 'RPT241',
    detail: "[Critical] - SQL Injection on /user/login parameter 'username'",
    severity: 'Critical',
  },
  {
    reportId: 'RPT213',
    detail: "[Critical] - SQL Injection on /user/login parameter 'username'",
    severity: 'Critical',
  },
  {
    reportId: 'RPT301',
    detail: "[High] - Stored XSS on /feedback parameter 'message'",
    severity: 'High',
  },
  {
    reportId: 'RPT318',
    detail: '[High] - IDOR on /invoices/:id allows data exposure',
    severity: 'High',
  },
  {
    reportId: 'RPT377',
    detail: '[Medium] - CSRF on /profile/update without token',
    severity: 'Medium',
  },
  {
    reportId: 'RPT402',
    detail: '[Medium] - Missing rate limit on /auth/otp',
    severity: 'Medium',
  },
  {
    reportId: 'RPT455',
    detail: '[Low] - Verbose error reveals stack trace on /health',
    severity: 'Low',
  },
  {
    reportId: 'RPT482',
    detail: '[Low] - Insecure cookie flags on session cookie',
    severity: 'Low',
  },
  {
    reportId: 'RPT509',
    detail: '[Informational] - Missing security headers on /docs',
    severity: 'Informational',
  },
  {
    reportId: 'RPT534',
    detail: '[Informational] - CSP report-only policy detected',
    severity: 'Informational',
  },
  {
    reportId: 'RPT560',
    detail: '[High] - Privilege escalation on /admin/users',
    severity: 'High',
  },
]

export { latestSessionHistoryData }
