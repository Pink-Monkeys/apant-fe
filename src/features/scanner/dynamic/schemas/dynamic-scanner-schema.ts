import { z } from 'zod'
import type { AgentLoopPayload } from '#/features/scanner/dynamic/types'

const scanTypeValues = ['quick', 'full', 'custom'] as const

export const scanTypeOptions = [
  { value: scanTypeValues[0], label: 'Quick scan' },
  { value: scanTypeValues[1], label: 'Full scan' },
  { value: scanTypeValues[2], label: 'Custom' },
] as const

const optionalUrl = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.string().url('Invalid URL').optional()
)

const optionalScanType = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.enum(scanTypeValues).optional()
)

export const dynamicScannerFormSchema = z.object({
  address: optionalUrl,
  scanType: optionalScanType,
  description: z.string().trim().min(1, 'Description is required'),
})

export type DynamicScannerFormValues = z.infer<typeof dynamicScannerFormSchema>

export function buildAgentLoopPayload(values: DynamicScannerFormValues): AgentLoopPayload {
  return {
    provider: 'openai',
    model: 'gpt-4o-mini',
    message: values.description.trim(),
  }
}
