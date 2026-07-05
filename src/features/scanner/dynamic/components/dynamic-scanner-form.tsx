import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Textarea } from '#/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Ban } from 'lucide-react'
import {
  cancelScan,
  getScanTypes,
  scanTypesQueryKey,
  startAgentLoopAsync,
} from '#/features/scanner/dynamic/api/dynamic-scanner-api'
import {
  buildAgentLoopPayload,
  defaultAuthValues,
  dynamicScannerFormSchema,
  validateAuthValues,
  type AuthFieldName,
  type AuthFormValues,
  type AuthMethod,
  type DynamicScannerFormValues,
} from '#/features/scanner/dynamic/schemas/dynamic-scanner-schema'
import type { AgentLoopPayload, StartScanResponse } from '#/features/scanner/dynamic/types'
import { getScanById, scanListQueryKeys } from '#/features/scanner/list/api/scan-list-api'
import {
  clearActiveScanId,
  getActiveScanId,
  setActiveScanId,
} from '#/features/scanner/dynamic/active-scan'
import { scanDetailToAgentLoopData } from '#/features/scanner/dynamic/scan-adapter'
import { ScanStatusBanner } from '#/features/scanner/components/scan-status-banner'
import { getErrorMessage, type HttpError } from '#/types/http'
import { getLlmOptions, llmOptionsQueryKey } from '#/features/llm/api/llm-api'
import { getLlmSelection, llmSelectionKey, resolveSelection } from '#/features/llm/selection'
import { LlmIndicator } from '#/features/llm/components/llm-indicator'
import { AuthSection } from './auth-section'
import DynamicScannerProcess from './dynamic-scanner-process'

export default function DynamicScannerForm() {
  // Id of the scan being watched. Seeded from localStorage so a running (or
  // finished) scan resumes after a refresh, navigation, or logout.
  const [activeScanId, setActiveScanIdState] = useState<string | null>(() => getActiveScanId())
  const [auth, setAuth] = useState<AuthFormValues>(defaultAuthValues)
  const [authErrors, setAuthErrors] = useState<Partial<Record<AuthFieldName, string>>>({})

  const handleAuthMethodChange = (method: AuthMethod) => {
    setAuth((prev) => ({ ...prev, method }))
    setAuthErrors({})
  }

  const handleAuthFieldChange = (field: AuthFieldName, value: string) => {
    setAuth((prev) => ({ ...prev, [field]: value }))
    setAuthErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const {
    data: scanTypes = [],
    isPending: isScanTypesPending,
    isError: isScanTypesError,
  } = useQuery({
    queryKey: scanTypesQueryKey,
    queryFn: getScanTypes,
  })

  // LLM options + persisted selection used to resolve which provider+model the
  // scan should use (see LlmIndicator for the visible summary).
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

  const defaultScanType = scanTypes[0]?.key

  const validateAddress = (value: DynamicScannerFormValues['address']) => {
    const result = dynamicScannerFormSchema.shape.address.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  const validateScanType = (value: DynamicScannerFormValues['scanType']) => {
    const result = dynamicScannerFormSchema.shape.scanType.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  const validateDescription = (value: DynamicScannerFormValues['description']) => {
    const result = dynamicScannerFormSchema.shape.description.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  const setActiveScan = (id: string | null) => {
    setActiveScanId(id)
    setActiveScanIdState(id)
  }

  const startMutation = useMutation<StartScanResponse, HttpError, AgentLoopPayload>({
    mutationFn: startAgentLoopAsync,
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

  // Toast only on a real running → terminal transition within this session, so a
  // resumed (already-terminal) scan after refresh does not re-toast.
  const sawRunningRef = useRef(false)
  const notifiedRef = useRef(false)
  useEffect(() => {
    if (status === 'running') {
      sawRunningRef.current = true
      return
    }
    if (!status) {
      return
    }
    if (sawRunningRef.current && !notifiedRef.current) {
      notifiedRef.current = true
      if (status === 'failed') {
        toast.error(scan?.error || 'Scan failed')
      } else if (status === 'cancelled') {
        toast.info('Scan cancelled')
      } else if (status === 'completed') {
        toast.success('Scan completed')
      }
    }
  }, [status, scan?.error])

  // Reset the transition guards whenever a new scan begins.
  useEffect(() => {
    sawRunningRef.current = false
    notifiedRef.current = false
  }, [activeScanId])

  // Once terminal, drop the persisted id so the next refresh starts clean. React
  // state is left intact so the finished results stay visible this session; the
  // full record remains available in Scan List.
  useEffect(() => {
    if (status && status !== 'running') {
      clearActiveScanId()
    }
  }, [status])

  // Elapsed time derived from the scan's creation timestamp while running; frozen
  // to the reported duration once terminal is not tracked here (kept simple).
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

  const defaultValues: DynamicScannerFormValues = {
    address: '',
    scanType: undefined,
    description: '',
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (startMutation.isPending || isRunning) {
        return
      }

      const result = dynamicScannerFormSchema.safeParse(value)
      if (!result.success) {
        return
      }

      const nextAuthErrors = validateAuthValues(auth)
      if (Object.keys(nextAuthErrors).length > 0) {
        setAuthErrors(nextAuthErrors)
        return
      }

      const selection = resolveSelection(llmSelection ?? null, llmOptions)
      await startMutation.mutateAsync(buildAgentLoopPayload(result.data, auth, selection))
    },
  })

  return (
    <div>
      <LlmIndicator />
      <Card className="border-primary mb-10 w-full border">
        <CardHeader>
          <CardTitle>Add Target</CardTitle>
          <CardDescription>
            Provide the target URL and describe the scan objective. Description is sent as the agent
            message.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          onReset={(event) => {
            event.preventDefault()
            form.reset()
            setAuth(defaultAuthValues)
            setAuthErrors({})
          }}
        >
          <CardContent>
            <FieldGroup>
              <form.Field
                name="address"
                validators={{
                  onChange: ({ value }) => validateAddress(value),
                  onSubmit: ({ value }) => validateAddress(value),
                }}
              >
                {(field) => {
                  const errors = (field.state.meta.errors ?? [])
                    .filter(Boolean)
                    .map((error) => ({ message: String(error) }))

                  return (
                    <Field data-invalid={errors.length > 0}>
                      <FieldLabel htmlFor={field.name}>URL Address</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="url"
                        placeholder="https://yourtarget.com"
                        autoComplete="url"
                        autoFocus
                        inputMode="url"
                        value={field.state.value ?? ''}
                        onChange={(event) => field.handleChange(event.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={errors} />
                    </Field>
                  )
                }}
              </form.Field>
              <form.Field
                name="scanType"
                validators={{
                  onChange: ({ value }) => validateScanType(value),
                  onSubmit: ({ value }) => validateScanType(value),
                }}
              >
                {(field) => {
                  const errors = (field.state.meta.errors ?? [])
                    .filter(Boolean)
                    .map((error) => ({ message: String(error) }))

                  return (
                    <Field className="w-full" data-invalid={errors.length > 0}>
                      <FieldLabel htmlFor={field.name}>Scan Type</FieldLabel>
                      <Select
                        value={field.state.value ?? defaultScanType}
                        onValueChange={(value) => field.handleChange(value)}
                        disabled={isScanTypesPending}
                      >
                        <SelectTrigger className="w-full max-w-48">
                          <SelectValue
                            placeholder={
                              isScanTypesPending ? 'Loading scan types...' : 'Select scan type'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Please select scan type</SelectLabel>
                            {scanTypes.map((option) => (
                              <SelectItem key={option.key} value={option.key}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {isScanTypesError ? (
                        <p className="text-destructive text-xs">
                          Failed to load scan types. The default scan type will be used.
                        </p>
                      ) : null}
                      <FieldError errors={errors} />
                    </Field>
                  )
                }}
              </form.Field>
              <AuthSection
                values={auth}
                errors={authErrors}
                onMethodChange={handleAuthMethodChange}
                onFieldChange={handleAuthFieldChange}
              />
              <form.Field
                name="description"
                validators={{
                  onChange: ({ value }) => validateDescription(value),
                  onSubmit: ({ value }) => validateDescription(value),
                }}
              >
                {(field) => {
                  const errors = (field.state.meta.errors ?? [])
                    .filter(Boolean)
                    .map((error) => ({ message: String(error) }))

                  return (
                    <Field data-invalid={errors.length > 0}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder="Describe the scan objective"
                        required
                        value={field.state.value}
                        onChange={(event) => field.handleChange(event.target.value)}
                        onBlur={field.handleBlur}
                      />
                      <FieldError errors={errors} />
                    </Field>
                  )
                }}
              </form.Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="mt-6 gap-2">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => {
                const isStarting = startMutation.isPending || isSubmitting
                return (
                  <>
                    <Button type="submit" disabled={isStarting || isRunning}>
                      {isRunning ? 'Scan running…' : isStarting ? 'Submitting...' : 'Submit'}
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
                      <Button type="reset" variant="outline" disabled={isStarting}>
                        Reset
                      </Button>
                    )}
                  </>
                )
              }}
            </form.Subscribe>
          </CardFooter>
        </form>
      </Card>
      {status ? <ScanStatusBanner status={status} error={scan?.error} /> : null}
      <DynamicScannerProcess response={processData} isLoading={isRunning} elapsedMs={elapsedMs} />
    </div>
  )
}
