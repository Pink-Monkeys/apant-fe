import { z } from 'zod'
import type { LlmSelection } from '#/features/llm/types'

const ZIP_EXTENSION = '.zip'

const isZipFile = (file: File) => file.name.toLowerCase().endsWith(ZIP_EXTENSION)

export const staticScannerFormSchema = z.object({
  file: z
    .instanceof(File, { message: 'Upload File is required' })
    .refine(isZipFile, 'ZIP archive only'),
  description: z.string().trim().optional(),
})

export type StaticScannerFormValues = z.infer<typeof staticScannerFormSchema>

// Final fallback when no LLM has been selected and no options are available.
const DEFAULT_PROVIDER = 'openai'
const DEFAULT_MODEL = 'gpt-5.4'

function resolveScanLlm(selection?: LlmSelection | null): LlmSelection {
  return selection ?? { provider: DEFAULT_PROVIDER, model: DEFAULT_MODEL }
}

export function buildStaticScanFormData(
  values: StaticScannerFormValues,
  selection?: LlmSelection | null
): FormData {
  const llm = resolveScanLlm(selection)
  const formData = new FormData()
  formData.append('file', values.file)
  formData.append('provider', llm.provider)
  formData.append('model', llm.model)
  formData.append('description', values.description?.trim() ?? '')
  return formData
}
