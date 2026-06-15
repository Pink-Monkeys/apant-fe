import { z } from 'zod'
import type { AgentLoopPayload } from '#/features/scanner/dynamic/types'

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

export function buildAgentLoopPayload(values: DynamicScannerFormValues): AgentLoopPayload {
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

  return payload
}
