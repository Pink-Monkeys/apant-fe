import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Button } from '#/components/ui/button'
import { Checkbox } from '#/components/ui/checkbox'
import { Label } from '#/components/ui/label'
import { Loader2 } from 'lucide-react'
import {
  addModel,
  llmOptionsQueryKey,
  llmProvidersQueryKey,
  testProvider,
} from '#/features/llm/api/llm-api'
import type { LlmProvider, TestProviderResponse } from '#/features/llm/types'
import { getErrorMessage, type HttpError } from '#/types/http'

type TestModelsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: LlmProvider | null
}

// Tests a provider's key, lists the models it exposes, and lets the admin pick
// which to add. Models already configured on the provider are pre-checked and
// disabled so they are not added twice.
export function TestModelsDialog({ open, onOpenChange, provider }: TestModelsDialogProps) {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<TestProviderResponse | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>({})

  const existingModelIds = new Set(provider?.models.map((model) => model.model_id) ?? [])

  // Reset transient state whenever the dialog opens for a (possibly different)
  // provider so stale test results are not shown.
  useEffect(() => {
    if (open) {
      setResult(null)
      setSelected({})
    }
  }, [open, provider?.id])

  const testMutation = useMutation<TestProviderResponse, HttpError, string>({
    mutationFn: testProvider,
    onSuccess: (response) => {
      setResult(response)
      if (response.ok) {
        toast.success(response.message || 'Provider berhasil diverifikasi')
      } else {
        toast.error(response.message || 'Verifikasi provider gagal')
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })

  const addMutation = useMutation<void, HttpError, string[]>({
    mutationFn: async (modelIds) => {
      if (!provider) {
        return
      }
      for (const modelId of modelIds) {
        await addModel(provider.id, { model_id: modelId, enabled: true })
      }
    },
    onSuccess: (_data, modelIds) => {
      queryClient.invalidateQueries({ queryKey: llmProvidersQueryKey })
      queryClient.invalidateQueries({ queryKey: llmOptionsQueryKey })
      toast.success(`${modelIds.length} model ditambahkan`)
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })

  const availableModels = result?.available_models ?? []
  const selectedIds = availableModels.filter(
    (modelId) => selected[modelId] && !existingModelIds.has(modelId)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Test &amp; Fetch Models</DialogTitle>
          <DialogDescription>
            Verifikasi API key {provider?.name ?? ''} dan pilih model yang ingin ditambahkan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            disabled={testMutation.isPending || !provider}
            onClick={() => provider && testMutation.mutate(provider.id)}
          >
            {testMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Menguji...
              </>
            ) : (
              'Test & Fetch Models'
            )}
          </Button>

          {result ? (
            availableModels.length > 0 ? (
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto border p-3">
                {availableModels.map((modelId) => {
                  const alreadyAdded = existingModelIds.has(modelId)
                  return (
                    <Label
                      key={modelId}
                      className="flex items-center gap-2 text-xs font-normal"
                      htmlFor={`model-${modelId}`}
                    >
                      <Checkbox
                        id={`model-${modelId}`}
                        checked={alreadyAdded || Boolean(selected[modelId])}
                        disabled={alreadyAdded}
                        onCheckedChange={(checked) =>
                          setSelected((prev) => ({ ...prev, [modelId]: checked === true }))
                        }
                      />
                      <span className="font-mono">{modelId}</span>
                      {alreadyAdded ? (
                        <span className="text-muted-foreground">(sudah ditambahkan)</span>
                      ) : null}
                    </Label>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">
                Tidak ada model yang tersedia dari provider ini.
              </p>
            )
          ) : null}
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button
            type="button"
            disabled={selectedIds.length === 0 || addMutation.isPending}
            onClick={() => addMutation.mutate(selectedIds)}
          >
            {addMutation.isPending ? 'Menambahkan...' : `Tambah ${selectedIds.length} Model`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
