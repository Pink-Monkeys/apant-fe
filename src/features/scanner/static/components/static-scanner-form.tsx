import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import { runStaticScan } from '#/features/scanner/static/api/static-scanner-api'
import {
  buildStaticScanFormData,
  staticScannerFormSchema,
} from '#/features/scanner/static/schemas/static-scanner-schema'
import type { StaticScanResponse } from '#/features/scanner/static/types'
import { getErrorMessage, type HttpError } from '#/types/http'
import StaticScannerResult from './static-scanner-result'

export default function StaticScannerForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [fileError, setFileError] = useState<string | undefined>(undefined)
  const [elapsedMs, setElapsedMs] = useState(0)

  const mutation = useMutation<StaticScanResponse, HttpError, FormData>({
    mutationFn: runStaticScan,
    onSuccess: (response) => {
      toast.success(response.message || 'Static scan completed')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })

  // Tick an elapsed timer while the scan runs so the user sees progress.
  useEffect(() => {
    if (!mutation.isPending) return
    setElapsedMs(0)
    const start = Date.now()
    const id = window.setInterval(() => setElapsedMs(Date.now() - start), 1000)
    return () => window.clearInterval(id)
  }, [mutation.isPending])

  const isZipSelected = file !== null && file.name.toLowerCase().endsWith('.zip')
  const canSubmit = isZipSelected && !mutation.isPending

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setFileError(undefined)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    const result = staticScannerFormSchema.safeParse({ file: file ?? undefined, description })
    if (!result.success) {
      setFileError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    setFileError(undefined)
    mutation.mutate(buildStaticScanFormData(result.data))
  }

  const handleReset = () => {
    setFile(null)
    setDescription('')
    setFileError(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    mutation.reset()
  }

  return (
    <div>
      <Card className="border-primary mb-10 w-full border">
        <CardHeader>
          <CardTitle>Static Scan (SAST)</CardTitle>
          <CardDescription>
            Upload a source code archive to run a static analysis. The scan runs synchronously and
            may take a few minutes.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} onReset={handleReset}>
          <CardContent>
            <FieldGroup>
              <Field data-invalid={Boolean(fileError)}>
                <FieldLabel htmlFor="file">Upload File</FieldLabel>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".zip"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <FieldDescription>ZIP archive only</FieldDescription>
                {fileError ? <FieldError errors={[{ message: fileError }]} /> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Analysis context or focus (optional). e.g. 'Focus on authentication & file upload modules'."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <FieldDescription>Optional</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="mt-6 gap-2">
            <Button type="submit" disabled={!canSubmit}>
              {mutation.isPending ? 'Scanning...' : 'Run Scan'}
            </Button>
            <Button type="reset" variant="outline" disabled={mutation.isPending}>
              Reset
            </Button>
          </CardFooter>
        </form>
      </Card>

      <StaticScannerResult
        result={mutation.data?.data ?? null}
        isLoading={mutation.isPending}
        elapsedMs={elapsedMs}
      />
    </div>
  )
}
