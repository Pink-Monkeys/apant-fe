import { z } from 'zod'
import type { AgentLoopPayload, AuthConfig } from '#/features/scanner/dynamic/types'

const optionalScanType = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().optional()
)

export const dynamicScannerFormSchema = z.object({
  address: z.string().trim().min(1, 'URL Address is required').url('Invalid URL'),
  scanType: optionalScanType,
  description: z.string().trim().min(1, 'Description is required'),
})

export type DynamicScannerFormValues = z.infer<typeof dynamicScannerFormSchema>

// ─── Authentication (optional, for scanning targets behind a login) ───────────

export const AUTH_METHODS = ['none', 'cookie', 'bearer', 'basic', 'header'] as const
export type AuthMethod = (typeof AUTH_METHODS)[number]

export const authMethodOptions: { value: AuthMethod; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'cookie', label: 'Cookie' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'header', label: 'Custom Header' },
]

// Zod is the single source of truth for conditional auth validation.
export const authValuesSchema = z
  .object({
    method: z.enum(AUTH_METHODS),
    cookie: z.string(),
    token: z.string(),
    username: z.string(),
    password: z.string(),
    headerName: z.string(),
    headerValue: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.method === 'cookie' && values.cookie.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['cookie'], message: 'Cookie is required' })
    }

    if (values.method === 'bearer' && values.token.trim() === '') {
      ctx.addIssue({ code: 'custom', path: ['token'], message: 'Token is required' })
    }

    if (values.method === 'basic') {
      if (values.username.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['username'], message: 'Username is required' })
      } else if (values.username.includes(':')) {
        ctx.addIssue({
          code: 'custom',
          path: ['username'],
          message: "Username must not contain a colon ':'.",
        })
      }
      if (values.password === '') {
        ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password is required' })
      }
    }

    if (values.method === 'header') {
      if (values.headerName.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['headerName'], message: 'Header Name is required' })
      }
      if (values.headerValue.trim() === '') {
        ctx.addIssue({ code: 'custom', path: ['headerValue'], message: 'Header Value is required' })
      }
    }
  })

export type AuthFormValues = z.infer<typeof authValuesSchema>
export type AuthFieldName = Exclude<keyof AuthFormValues, 'method'>

export const defaultAuthValues: AuthFormValues = {
  method: 'none',
  cookie: '',
  token: '',
  username: '',
  password: '',
  headerName: '',
  headerValue: '',
}

export function validateAuthValues(values: AuthFormValues): Partial<Record<AuthFieldName, string>> {
  const result = authValuesSchema.safeParse(values)
  if (result.success) {
    return {}
  }

  const errors: Partial<Record<AuthFieldName, string>> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as AuthFieldName | undefined
    if (key && !errors[key]) {
      errors[key] = issue.message
    }
  }
  return errors
}

// Maps the form's auth values to the backend AuthConfig, or undefined when the
// user picked "None" (the auth field is then omitted from the payload entirely).
export function buildAuthConfig(values: AuthFormValues): AuthConfig | undefined {
  switch (values.method) {
    case 'cookie':
      return { type: 'cookie', value: values.cookie }
    case 'bearer':
      return { type: 'bearer', value: values.token.trim() }
    case 'basic':
      return { type: 'basic', value: `${values.username.trim()}:${values.password}` }
    case 'header':
      return {
        type: 'header',
        value: values.headerValue,
        header_name: values.headerName.trim(),
      }
    default:
      return undefined
  }
}

export function buildAgentLoopPayload(
  values: DynamicScannerFormValues,
  auth?: AuthFormValues
): AgentLoopPayload {
  const payload: AgentLoopPayload = {
    provider: 'openai',
    model: 'gpt-5.4',
    target: values.address.trim(),
    description: values.description.trim(),
    max_steps: 15,
  }

  if (values.scanType) {
    payload.scan_type = values.scanType
  }

  const authConfig = auth ? buildAuthConfig(auth) : undefined
  if (authConfig) {
    payload.auth = authConfig
  }

  return payload
}
