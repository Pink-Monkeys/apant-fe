import { z } from 'zod'

const ZIP_EXTENSION = '.zip'

const isZipFile = (file: File) => file.name.toLowerCase().endsWith(ZIP_EXTENSION)

export const staticScannerFormSchema = z.object({
  file: z
    .instanceof(File, { message: 'Upload File is required' })
    .refine(isZipFile, 'ZIP archive only'),
  description: z.string().trim().optional(),
})

export type StaticScannerFormValues = z.infer<typeof staticScannerFormSchema>

// Hardcoded scan parameters; not exposed to the user.
const STATIC_SCAN_PROVIDER = 'openai'
const STATIC_SCAN_MODEL = 'gpt-5.4'

export function buildStaticScanFormData(values: StaticScannerFormValues): FormData {
  const formData = new FormData()
  formData.append('file', values.file)
  formData.append('provider', STATIC_SCAN_PROVIDER)
  formData.append('model', STATIC_SCAN_MODEL)
  formData.append('description', values.description?.trim() ?? '')
  return formData
}
