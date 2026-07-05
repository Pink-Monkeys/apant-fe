import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
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
import { Ban } from 'lucide-react'
import { startStaticScanAsync } from '#/features/scanner/static/api/static-scanner-api'
import {
  buildStaticScanFormData,
  staticScannerFormSchema,
} from '#/features/scanner/static/schemas/static-scanner-schema'
import type { StartStaticScanResponse } from '#/features/scanner/static/types'
import { cancelScan } from '#/features/scanner/dynamic/api/dynamic-scanner-api'
import { getScanById, scanListQueryKeys } from '#/features/scanner/list/api/scan-list-api'
import type { ScanStatus } from '#/features/scanner/list/types'
import { scanDetailToAgentLoopData } from '#/features/scanner/dynamic/scan-adapter'
import { ScanStatusBanner } from '#/features/scanner/components/scan-status-banner'
import { getActiveStaticScanId, setActiveStaticScanId } from '#/features/scanner/static/active-scan'
import { getErrorMessage, type HttpError } from '#/types/http'
import { getLlmOptions, llmOptionsQueryKey } from '#/features/llm/api/llm-api'
import { getLlmSelection, llmSelectionKey, resolveSelection } from '#/features/llm/selection'
import { LlmIndicator } from '#/features/llm/components/llm-indicator'
import DynamicScannerProcess from '#/features/scanner/dynamic/components/dynamic-scanner-process'

export default function StaticScannerForm() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [fileError, setFileError] = useState<string | undefined>(undefined)

  // Id of the scan being watched. Seeded from localStorage so a running (or
  // finished) scan resumes after a refresh, navigation, or logout.
  const [activeScanId, setActiveScanIdState] = useState<string | null>(() =>
    getActiveStaticScanId()
  )

  const { data: llmOptions = [] } = useQuery({
    queryKey: llmOptionsQueryKey,
    queryFn: getLlmOptions,
  })
  const { data: llmSelection } = useQuery({
    queryKey: llmSelectionKey,
    queryFn: () => getLlmSelection(),
    initialData: () => getLlmSelection(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const setActiveScan = (id: string | null) => {
    setActiveStaticScanId(id)
    setActiveScanIdState(id)
  }

  const startMutation = useMutation<StartStaticScanResponse, HttpError, FormData>({
    mutationFn: startStaticScanAsync,
    onSuccess: (response) => {
      const scanId = response.data?.scan_id
      if (scanId) {
        setActiveScan(scanId)
      }
      toast.success('Scan started')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })

  // Poll the active scan while it is running; stop once it reaches a terminal
  // status. Works across refresh/logout because the scan lives in the DB.
  const { data: scan } = useQuery({
    queryKey: scanListQueryKeys.detail(activeScanId ?? ''),
    queryFn: () => getScanById(activeScanId as string),
    enabled: Boolean(activeScanId),
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 3000 : false),
  })

  const status = scan?.status
  const isRunning = status === 'running'

  const cancelMutation = useMutation<void, HttpError, string>({
    mutationFn: cancelScan,
    onSuccess: () => {
      toast.success('Cancelling…')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })

  // Toast exactly once per terminal-status transition (not on every poll).
  const notifiedStatusRef = useRef<ScanStatus | null>(null)
  useEffect(() => {
    if (!status || status === 'running') {
      return
    }
    if (notifiedStatusRef.current === status) {
      return
    }
    notifiedStatusRef.current = status
    if (status === 'failed') {
      toast.error(scan?.error || 'Scan failed')
    } else if (status === 'cancelled') {
      toast.info('Scan cancelled')
    }
  }, [status, scan?.error])

  // Reset the transition guard whenever a new scan begins.
  useEffect(() => {
    notifiedStatusRef.current = null
  }, [activeScanId])

  // Elapsed time derived from the scan's creation timestamp while running.
  const [elapsedMs, setElapsedMs] = useState(0)
  useEffect(() => {
    if (!scan || !isRunning) {
      return
    }
    const startedAt = new Date(scan.created_at).getTime()
    const tick = () => setElapsedMs(Date.now() - startedAt)
    tick()
    const intervalId = window.setInterval(tick, 1000)
    return () => window.clearInterval(intervalId)
  }, [scan, isRunning])

  const processData = scan ? scanDetailToAgentLoopData(scan) : null

  const isZipSelected = file !== null && file.name.toLowerCase().endsWith('.zip')
  const canSubmit = isZipSelected && !startMutation.isPending && !isRunning

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setFileError(undefined)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (startMutation.isPending || isRunning) {
      return
    }

    const result = staticScannerFormSchema.safeParse({ file: file ?? undefined, description })
    if (!result.success) {
      setFileError(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    setFileError(undefined)
    const selection = resolveSelection(llmSelection ?? null, llmOptions)
    startMutation.mutate(buildStaticScanFormData(result.data, selection))
  }

  const handleReset = () => {
    setFile(null)
    setDescription('')
    setFileError(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <LlmIndicator />
      <Card className="border-primary mb-10 w-full border">
        <CardHeader>
          <CardTitle>Static Scan (SAST)</CardTitle>
          <CardDescription>
            Upload a source code archive to run a static analysis. The scan runs in the background —
            you can leave this page and come back.
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
                  disabled={isRunning}
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
                  disabled={isRunning}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <FieldDescription>Optional</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="mt-6 gap-2">
            <Button type="submit" disabled={!canSubmit}>
              {isRunning ? 'Scan running…' : startMutation.isPending ? 'Submitting...' : 'Run Scan'}
            </Button>
            {isRunning ? (
              <Button
                type="button"
                variant="destructive"
                disabled={cancelMutation.isPending || !activeScanId}
                onClick={() => activeScanId && cancelMutation.mutate(activeScanId)}
              >
                <Ban className="size-4" />
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Scan'}
              </Button>
            ) : (
              <Button type="reset" variant="outline" disabled={startMutation.isPending}>
                Reset
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {status ? <ScanStatusBanner status={status} error={scan?.error} /> : null}
      <DynamicScannerProcess response={processData} isLoading={isRunning} elapsedMs={elapsedMs} />
    </div>
  )
}
