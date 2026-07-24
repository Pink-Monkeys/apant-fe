import { useState } from 'react'
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
import { Input } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { Badge } from '#/components/ui/badge'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import {
  addModel,
  deleteModel,
  llmOptionsQueryKey,
  llmProvidersQueryKey,
  updateModel,
} from '#/features/llm/api/llm-api'
import {
  DEFAULT_PRICE_CURRENCY,
  modelSchema,
  parseModelPrice,
} from '#/features/llm/schemas/llm-schema'
import type {
  AddModelPayload,
  LlmModel,
  LlmProvider,
  UpdateModelPayload,
} from '#/features/llm/types'
import { getErrorMessage, type HttpError } from '#/types/http'
import { ConfirmDeleteDialog } from '#/features/llm/components/confirm-delete-dialog'

type ManageModelsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: LlmProvider | null
}

// Per-provider model management: toggle enabled, inline-edit label/model_id,
// delete, and add a model manually.
export function ManageModelsDialog({ open, onOpenChange, provider }: ManageModelsDialogProps) {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editModelId, setEditModelId] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [editPriceIn, setEditPriceIn] = useState('')
  const [editPriceOut, setEditPriceOut] = useState('')
  const [newModelId, setNewModelId] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newPriceIn, setNewPriceIn] = useState('')
  const [newPriceOut, setNewPriceOut] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<LlmModel | null>(null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: llmProvidersQueryKey })
    queryClient.invalidateQueries({ queryKey: llmOptionsQueryKey })
  }

  const onError = (error: HttpError) => {
    toast.error(getErrorMessage(error.data, error.message))
  }

  const updateMutation = useMutation<
    void,
    HttpError,
    { modelId: string; payload: UpdateModelPayload }
  >({
    mutationFn: ({ modelId, payload }) => {
      if (!provider) {
        return Promise.resolve()
      }
      return updateModel(provider.id, modelId, payload)
    },
    onSuccess: () => {
      invalidate()
      setEditingId(null)
      toast.success('Model updated')
    },
    onError,
  })

  const addMutation = useMutation<void, HttpError, AddModelPayload>({
    mutationFn: (payload) => {
      if (!provider) {
        return Promise.resolve()
      }
      return addModel(provider.id, payload)
    },
    onSuccess: () => {
      invalidate()
      setNewModelId('')
      setNewLabel('')
      setNewPriceIn('')
      setNewPriceOut('')
      toast.success('Model added')
    },
    onError,
  })

  const deleteMutation = useMutation<void, HttpError, string>({
    mutationFn: (modelId) => {
      if (!provider) {
        return Promise.resolve()
      }
      return deleteModel(provider.id, modelId)
    },
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
      toast.success('Model deleted')
    },
    onError,
  })

  const startEdit = (model: LlmModel) => {
    setEditingId(model.id)
    setEditModelId(model.model_id)
    // label is `omitempty` on the backend, so an empty label arrives as undefined;
    // coerce to '' to keep the input controlled and `.trim()` safe.
    setEditLabel(model.label ?? '')
    setEditPriceIn(model.price_in_per_1m != null ? String(model.price_in_per_1m) : '')
    setEditPriceOut(model.price_out_per_1m != null ? String(model.price_out_per_1m) : '')
  }

  const saveEdit = (model: LlmModel) => {
    const result = modelSchema.safeParse({
      model_id: editModelId,
      label: editLabel,
      enabled: model.enabled,
    })
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Invalid input')
      return
    }
    const price = parseModelPrice(editPriceIn, editPriceOut)
    if (!price.ok) {
      toast.error(price.error)
      return
    }
    const payload: UpdateModelPayload = {
      model_id: editModelId.trim(),
      label: (editLabel ?? '').trim(),
    }
    if (price.priced) {
      payload.price_in_per_1m = price.priced.in
      payload.price_out_per_1m = price.priced.out
      payload.currency = model.currency || DEFAULT_PRICE_CURRENCY
    } else {
      // Both blank => clear any existing price back to unpriced.
      payload.clear_price = true
    }
    updateMutation.mutate({ modelId: model.id, payload })
  }

  const handleAdd = () => {
    const result = modelSchema.safeParse({ model_id: newModelId, label: newLabel, enabled: true })
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Model ID is required')
      return
    }
    const price = parseModelPrice(newPriceIn, newPriceOut)
    if (!price.ok) {
      toast.error(price.error)
      return
    }
    const payload: AddModelPayload = {
      model_id: newModelId.trim(),
      label: newLabel.trim(),
      enabled: true,
    }
    if (price.priced) {
      payload.price_in_per_1m = price.priced.in
      payload.price_out_per_1m = price.priced.out
      payload.currency = DEFAULT_PRICE_CURRENCY
    }
    addMutation.mutate(payload)
  }

  const models = provider?.models ?? []

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Models — {provider?.name ?? ''}</DialogTitle>
            <DialogDescription>
              Enable/disable, edit, or delete models, and add a model manually.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {models.length === 0 ? (
              <p className="text-muted-foreground text-xs">No models yet.</p>
            ) : (
              models.map((model) => {
                const isEditing = editingId === model.id
                return (
                  <div key={model.id} className="flex items-center gap-2 border p-2 text-xs">
                    {isEditing ? (
                      <div className="flex flex-1 flex-col gap-1.5">
                        <Input
                          className="h-7"
                          placeholder="model_id"
                          value={editModelId}
                          onChange={(event) => setEditModelId(event.target.value)}
                        />
                        <Input
                          className="h-7"
                          placeholder="label (optional)"
                          value={editLabel}
                          onChange={(event) => setEditLabel(event.target.value)}
                        />
                        <div className="flex items-center gap-1.5">
                          <Input
                            className="h-7"
                            inputMode="decimal"
                            placeholder="in $/1M"
                            value={editPriceIn}
                            onChange={(event) => setEditPriceIn(event.target.value)}
                          />
                          <Input
                            className="h-7"
                            inputMode="decimal"
                            placeholder="out $/1M"
                            value={editPriceOut}
                            onChange={(event) => setEditPriceOut(event.target.value)}
                          />
                        </div>
                        <span className="text-muted-foreground text-[10px]">
                          Price per 1M tokens (USD). Leave both blank to clear. Check the provider
                          dashboard for current rates.
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col">
                        <span className="font-mono font-medium">{model.model_id}</span>
                        {model.label ? (
                          <span className="text-muted-foreground">{model.label}</span>
                        ) : null}
                        <ModelPriceLabel model={model} />
                      </div>
                    )}

                    {!isEditing ? (
                      <Badge variant={model.enabled ? 'default' : 'outline'}>
                        {model.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    ) : null}

                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          disabled={updateMutation.isPending}
                          onClick={() => saveEdit(model)}
                          aria-label="Save"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          aria-label="Cancel"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={model.enabled}
                          disabled={updateMutation.isPending}
                          onCheckedChange={(checked) =>
                            updateMutation.mutate({
                              modelId: model.id,
                              payload: { enabled: checked },
                            })
                          }
                          aria-label="Toggle enabled"
                        />
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => startEdit(model)}
                          aria-label="Edit model"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(model)}
                          aria-label="Delete model"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-medium">Add Model Manually</p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  className="h-8"
                  placeholder="model_id (e.g. gpt-5.4)"
                  value={newModelId}
                  onChange={(event) => setNewModelId(event.target.value)}
                />
                <Input
                  className="h-8"
                  placeholder="label (optional)"
                  value={newLabel}
                  onChange={(event) => setNewLabel(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  className="h-8"
                  inputMode="decimal"
                  placeholder="price in $/1M (optional)"
                  value={newPriceIn}
                  onChange={(event) => setNewPriceIn(event.target.value)}
                />
                <Input
                  className="h-8"
                  inputMode="decimal"
                  placeholder="price out $/1M (optional)"
                  value={newPriceOut}
                  onChange={(event) => setNewPriceOut(event.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={addMutation.isPending}
                  onClick={handleAdd}
                >
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              <span className="text-muted-foreground text-[10px]">
                Price per 1M tokens (USD), both or neither. Leave blank for an unpriced model; 0
                marks a free model. Example format: 0.28 / 0.88 — check the provider dashboard for
                current rates.
              </span>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title="Delete Model"
        description={`Delete model "${deleteTarget?.model_id ?? ''}"? This action cannot be undone.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </>
  )
}

// ModelPriceLabel renders a model's per-1M price, distinguishing "no price set"
// (unpriced — cost unknowable) from a genuine "Free" (0) model.
function ModelPriceLabel({ model }: { model: LlmModel }) {
  const hasPrice = model.price_in_per_1m != null && model.price_out_per_1m != null
  if (!hasPrice) {
    return <span className="text-muted-foreground text-[10px] italic">No price set</span>
  }
  if (model.price_in_per_1m === 0 && model.price_out_per_1m === 0) {
    return <span className="text-[10px] font-medium text-green-600 dark:text-green-400">Free</span>
  }
  const cur = model.currency || 'USD'
  const fmt = (n: number) => (cur === 'USD' ? `$${n}` : `${n} ${cur}`)
  return (
    <span className="text-muted-foreground font-mono text-[10px]">
      {fmt(model.price_in_per_1m as number)} in / {fmt(model.price_out_per_1m as number)} out · per
      1M
    </span>
  )
}
