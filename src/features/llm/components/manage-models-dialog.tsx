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
import { modelSchema } from '#/features/llm/schemas/llm-schema'
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
  const [newModelId, setNewModelId] = useState('')
  const [newLabel, setNewLabel] = useState('')
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
      toast.success('Model diperbarui')
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
      toast.success('Model ditambahkan')
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
      toast.success('Model dihapus')
    },
    onError,
  })

  const startEdit = (model: LlmModel) => {
    setEditingId(model.id)
    setEditModelId(model.model_id)
    setEditLabel(model.label)
  }

  const saveEdit = (model: LlmModel) => {
    const result = modelSchema.safeParse({
      model_id: editModelId,
      label: editLabel,
      enabled: model.enabled,
    })
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Input tidak valid')
      return
    }
    updateMutation.mutate({
      modelId: model.id,
      payload: { model_id: editModelId.trim(), label: editLabel.trim() },
    })
  }

  const handleAdd = () => {
    const result = modelSchema.safeParse({ model_id: newModelId, label: newLabel, enabled: true })
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Model ID wajib diisi')
      return
    }
    addMutation.mutate({ model_id: newModelId.trim(), label: newLabel.trim(), enabled: true })
  }

  const models = provider?.models ?? []

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Kelola Model — {provider?.name ?? ''}</DialogTitle>
            <DialogDescription>
              Aktif/nonaktifkan, ubah, atau hapus model, dan tambah model manual.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {models.length === 0 ? (
              <p className="text-muted-foreground text-xs">Belum ada model.</p>
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
                          placeholder="label (opsional)"
                          value={editLabel}
                          onChange={(event) => setEditLabel(event.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="flex flex-1 flex-col">
                        <span className="font-mono font-medium">{model.model_id}</span>
                        {model.label ? (
                          <span className="text-muted-foreground">{model.label}</span>
                        ) : null}
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
                          aria-label="Simpan"
                        >
                          <Check className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                          aria-label="Batal"
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
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(model)}
                          aria-label="Hapus"
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
            <p className="mb-2 text-xs font-medium">Tambah Model Manual</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                className="h-8"
                placeholder="model_id (mis. gpt-5.4)"
                value={newModelId}
                onChange={(event) => setNewModelId(event.target.value)}
              />
              <Input
                className="h-8"
                placeholder="label (opsional)"
                value={newLabel}
                onChange={(event) => setNewLabel(event.target.value)}
              />
              <Button type="button" size="sm" disabled={addMutation.isPending} onClick={handleAdd}>
                <Plus className="size-4" />
                Tambah
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title="Hapus Model"
        description={`Hapus model "${deleteTarget?.model_id ?? ''}"? Tindakan ini tidak dapat dibatalkan.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </>
  )
}
