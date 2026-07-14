import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Loader2 } from 'lucide-react'
import { getLlmOptions, llmOptionsQueryKey } from '#/features/llm/api/llm-api'
import { firstOptionSelection, useLlmSelection, useSetLlmSelection } from '#/features/llm/selection'
import { getErrorMessage, type HttpError } from '#/types/http'

export function LlmSelector() {
  const {
    data: options = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: llmOptionsQueryKey,
    queryFn: getLlmOptions,
  })

  const { data: stored } = useLlmSelection()
  const saveSelection = useSetLlmSelection()

  const [providerName, setProviderName] = useState('')
  const [modelId, setModelId] = useState('')

  // Seed the two selects from the persisted (backend) selection, falling back to
  // the first available option. Runs when options or the stored selection change.
  useEffect(() => {
    if (options.length === 0) {
      return
    }
    const fallback = firstOptionSelection(options)
    const provider =
      stored && options.some((option) => option.name === stored.provider)
        ? stored.provider
        : (fallback?.provider ?? '')
    setProviderName(provider)

    const providerOption = options.find((option) => option.name === provider)
    const model =
      stored && providerOption?.models.includes(stored.model)
        ? stored.model
        : (providerOption?.models[0] ?? '')
    setModelId(model)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, stored])

  const modelsForProvider = useMemo(
    () => options.find((option) => option.name === providerName)?.models ?? [],
    [options, providerName]
  )

  const handleProviderChange = (value: string) => {
    setProviderName(value)
    const nextModels = options.find((option) => option.name === value)?.models ?? []
    setModelId(nextModels[0] ?? '')
  }

  const handleSave = () => {
    if (!providerName || !modelId) {
      toast.error('Please select a provider and model first')
      return
    }
    saveSelection.mutate(
      { provider: providerName, model: modelId },
      {
        onSuccess: () => {
          toast.success(`Active LLM: ${providerName} / ${modelId}`)
        },
        onError: (mutationError: HttpError) => {
          toast.error(getErrorMessage(mutationError.data, mutationError.message))
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader2 className="text-primary size-8 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading LLM options...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex h-64 flex-col items-center justify-center gap-2 border p-4">
        <span className="font-semibold">Failed to Load LLM Options</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <Card className="border-primary border">
        <CardHeader>
          <CardTitle>Select LLM</CardTitle>
          <CardDescription>
            No LLM providers are available yet. Contact an admin to enable one.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-primary max-w-lg border">
      <CardHeader>
        <CardTitle>Select LLM</CardTitle>
        <CardDescription>Choose the provider and model to use for your scans.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="llm-provider">Provider</FieldLabel>
            <Select value={providerName} onValueChange={handleProviderChange}>
              <SelectTrigger id="llm-provider" className="w-full">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.name} value={option.name}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel htmlFor="llm-model">Model</FieldLabel>
            <Select
              value={modelId}
              onValueChange={setModelId}
              disabled={modelsForProvider.length === 0}
            >
              <SelectTrigger id="llm-model" className="w-full">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelsForProvider.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          onClick={handleSave}
          disabled={!providerName || !modelId || saveSelection.isPending}
        >
          {saveSelection.isPending ? 'Saving…' : 'Save Selection'}
        </Button>
      </CardFooter>
    </Card>
  )
}
