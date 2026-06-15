import { useEffect, useState } from 'react'
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
import {
  getScanTypes,
  scanTypesQueryKey,
  startAgentLoop,
} from '#/features/scanner/dynamic/api/dynamic-scanner-api'
import {
  buildAgentLoopPayload,
  dynamicScannerFormSchema,
  type DynamicScannerFormValues,
} from '#/features/scanner/dynamic/schemas/dynamic-scanner-schema'
import type { AgentLoopPayload, AgentLoopResponse } from '#/features/scanner/dynamic/types'
import { getErrorMessage, type HttpError } from '#/types/http'
import DynamicScannerProcess from './dynamic-scanner-process'

export default function DynamicScannerForm() {
  const [latestResponse, setLatestResponse] = useState<AgentLoopResponse | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)

  const {
    data: scanTypes = [],
    isPending: isScanTypesPending,
    isError: isScanTypesError,
  } = useQuery({
    queryKey: scanTypesQueryKey,
    queryFn: getScanTypes,
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

  const mutation = useMutation<AgentLoopResponse, HttpError, AgentLoopPayload>({
    mutationFn: startAgentLoop,
    onSuccess: (response) => {
      setLatestResponse(response)

      if (import.meta.env.DEV) {
        console.log('Dynamic scan response:', response)
      }

      toast.success(response.message || 'Dynamic scan submitted')
    },
    onError: (error) => {
      const message = getErrorMessage(error.data, error.message)
      toast.error(message)
    },
  })

  useEffect(() => {
    if (!mutation.isPending) {
      return
    }

    setElapsedMs(0)
    const start = Date.now()
    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - start)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [mutation.isPending])

  const defaultValues: DynamicScannerFormValues = {
    address: '',
    scanType: undefined,
    description: '',
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (mutation.isPending) {
        return
      }

      const result = dynamicScannerFormSchema.safeParse(value)
      if (!result.success) {
        return
      }

      setLatestResponse(null)
      await mutation.mutateAsync(buildAgentLoopPayload(result.data))
    },
  })

  return (
    <div>
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
              {(isSubmitting) => (
                <>
                  <Button type="submit" disabled={mutation.isPending || isSubmitting}>
                    {mutation.isPending || isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                  <Button
                    type="reset"
                    variant="outline"
                    disabled={mutation.isPending || isSubmitting}
                  >
                    Reset
                  </Button>
                </>
              )}
            </form.Subscribe>
          </CardFooter>
        </form>
      </Card>
      <DynamicScannerProcess
        response={latestResponse?.data ?? null}
        isLoading={mutation.isPending}
        elapsedMs={elapsedMs}
      />
    </div>
  )
}
