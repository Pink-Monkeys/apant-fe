import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Ellipsis, ListChecks, Loader2, Pencil, Plus, ScanSearch, Trash2 } from 'lucide-react'
import {
  createProvider,
  deleteProvider,
  getProviders,
  llmOptionsQueryKey,
  llmProvidersQueryKey,
  updateProvider,
} from '#/features/llm/api/llm-api'
import type {
  CreateProviderPayload,
  LlmProvider,
  UpdateProviderPayload,
} from '#/features/llm/types'
import { getErrorMessage, type HttpError } from '#/types/http'
import { ProviderFormDialog } from '#/features/llm/components/provider-form-dialog'
import { ConfirmDeleteDialog } from '#/features/llm/components/confirm-delete-dialog'
import { TestModelsDialog } from '#/features/llm/components/test-models-dialog'
import { ManageModelsDialog } from '#/features/llm/components/manage-models-dialog'

export function ProviderManager() {
  const queryClient = useQueryClient()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<LlmProvider | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LlmProvider | null>(null)
  const [testTarget, setTestTarget] = useState<LlmProvider | null>(null)
  const [modelsTarget, setModelsTarget] = useState<LlmProvider | null>(null)

  const {
    data: providers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: llmProvidersQueryKey,
    queryFn: getProviders,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: llmProvidersQueryKey })
    queryClient.invalidateQueries({ queryKey: llmOptionsQueryKey })
  }

  const onError = (err: HttpError) => {
    toast.error(getErrorMessage(err.data, err.message))
  }

  const createMutation = useMutation<LlmProvider | null, HttpError, CreateProviderPayload>({
    mutationFn: createProvider,
    onSuccess: () => {
      invalidate()
      setFormOpen(false)
      toast.success('Provider added')
    },
    onError,
  })

  const updateMutation = useMutation<
    LlmProvider | null,
    HttpError,
    { id: string; payload: UpdateProviderPayload }
  >({
    mutationFn: ({ id, payload }) => updateProvider(id, payload),
    onSuccess: () => {
      invalidate()
      setFormOpen(false)
      setEditing(null)
      toast.success('Provider updated')
    },
    onError,
  })

  const deleteMutation = useMutation<void, HttpError, string>({
    mutationFn: deleteProvider,
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
      toast.success('Provider deleted')
    },
    onError,
  })

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (provider: LlmProvider) => {
    setEditing(provider)
    setFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader2 className="text-primary size-8 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading LLM providers...</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex h-64 flex-col items-center justify-center gap-2 border p-4">
        <span className="font-semibold">Failed to Load Providers</span>
        <span className="text-muted-foreground text-xs">
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      </div>
    )
  }

  return (
    <Card className="border-primary border">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>LLM Providers</CardTitle>
          <p className="text-muted-foreground mt-1 text-xs">
            Manage the providers and models available to all users.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Provider
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Adapter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Models</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground py-8 text-center text-xs">
                    No providers yet. Click &quot;Add Provider&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell className="font-medium">{provider.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{provider.adapter_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={provider.enabled ? 'default' : 'outline'}>
                        {provider.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {provider.has_key ? (
                        <span className="font-mono text-xs">•••• {provider.key_last4}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">no key</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs">{provider.models.length}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground h-7 w-7"
                            aria-label={`Actions for ${provider.name}`}
                          >
                            <Ellipsis className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            className="gap-2 text-xs"
                            onClick={() => setTestTarget(provider)}
                          >
                            <ScanSearch className="text-muted-foreground size-3.5" />
                            Test &amp; Fetch Models
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-xs"
                            onClick={() => setModelsTarget(provider)}
                          >
                            <ListChecks className="text-muted-foreground size-3.5" />
                            Manage Models
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-xs"
                            onClick={() => openEdit(provider)}
                          >
                            <Pencil className="text-muted-foreground size-3.5" />
                            Edit Provider
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive! gap-2 text-xs"
                            onClick={() => setDeleteTarget(provider)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete Provider
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <ProviderFormDialog
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next)
          if (!next) {
            setEditing(null)
          }
        }}
        provider={editing}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onCreate={(payload) => createMutation.mutate(payload)}
        onUpdate={(id, payload) => updateMutation.mutate({ id, payload })}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => !next && setDeleteTarget(null)}
        title="Delete Provider"
        description={`Delete provider "${deleteTarget?.name ?? ''}" and all of its models? This action cannot be undone.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />

      <TestModelsDialog
        open={Boolean(testTarget)}
        onOpenChange={(next) => !next && setTestTarget(null)}
        provider={testTarget}
      />

      <ManageModelsDialog
        open={Boolean(modelsTarget)}
        onOpenChange={(next) => !next && setModelsTarget(null)}
        provider={
          // Keep the models dialog in sync with fresh query data after mutations.
          modelsTarget ? (providers.find((p) => p.id === modelsTarget.id) ?? modelsTarget) : null
        }
      />
    </Card>
  )
}
