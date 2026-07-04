import { useForm } from '@tanstack/react-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Switch } from '#/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import {
  adapterTypeOptions,
  createProviderSchema,
  editProviderSchema,
  type CreateProviderFormValues,
} from '#/features/llm/schemas/llm-schema'
import type {
  AdapterType,
  CreateProviderPayload,
  LlmProvider,
  UpdateProviderPayload,
} from '#/features/llm/types'

type ProviderFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // When provided, the dialog is in edit mode.
  provider?: LlmProvider | null
  isSubmitting: boolean
  onCreate: (payload: CreateProviderPayload) => void
  onUpdate: (id: string, payload: UpdateProviderPayload) => void
}

// Shared create/edit dialog. In edit mode the api_key field starts empty and is
// only sent when the admin types a new key, preserving the existing one.
export function ProviderFormDialog({
  open,
  onOpenChange,
  provider,
  isSubmitting,
  onCreate,
  onUpdate,
}: ProviderFormDialogProps) {
  const isEdit = Boolean(provider)
  const schema = isEdit ? editProviderSchema : createProviderSchema

  const defaultValues: CreateProviderFormValues = {
    name: provider?.name ?? '',
    adapter_type: (provider?.adapter_type as AdapterType) ?? 'openai-compatible',
    api_key: '',
    base_url: provider?.base_url ?? '',
    enabled: provider?.enabled ?? true,
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const result = schema.safeParse(value)
      if (!result.success) {
        return
      }

      const apiKey = result.data.api_key.trim()
      const baseUrl = result.data.base_url?.trim() ?? ''

      if (isEdit && provider) {
        const payload: UpdateProviderPayload = {
          name: result.data.name,
          adapter_type: result.data.adapter_type,
          base_url: baseUrl,
          enabled: result.data.enabled,
        }
        // Only send api_key when the admin typed a new one.
        if (apiKey) {
          payload.api_key = apiKey
        }
        onUpdate(provider.id, payload)
      } else {
        const payload: CreateProviderPayload = {
          name: result.data.name,
          adapter_type: result.data.adapter_type,
          api_key: apiKey,
          base_url: baseUrl,
          enabled: result.data.enabled,
        }
        onCreate(payload)
      }
    },
  })

  const fieldError = <K extends keyof CreateProviderFormValues>(
    value: CreateProviderFormValues[K],
    key: K
  ) => {
    const result = schema.shape[key].safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Provider' : 'Add Provider'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the LLM provider configuration. Leave the API key empty to keep the current one.'
              : 'Add a new LLM provider along with its API key.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => fieldError(value, 'name'),
                onSubmit: ({ value }) => fieldError(value, 'name'),
              }}
            >
              {(field) => {
                const errors = (field.state.meta.errors ?? [])
                  .filter(Boolean)
                  .map((error) => ({ message: String(error) }))
                return (
                  <Field data-invalid={errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="OpenAI"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError errors={errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="adapter_type">
              {(field) => (
                <Field className="w-full">
                  <FieldLabel htmlFor={field.name}>Adapter Type</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as AdapterType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select adapter type" />
                    </SelectTrigger>
                    <SelectContent>
                      {adapterTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field
              name="api_key"
              validators={{
                onChange: ({ value }) => fieldError(value, 'api_key'),
                onSubmit: ({ value }) => fieldError(value, 'api_key'),
              }}
            >
              {(field) => {
                const errors = (field.state.meta.errors ?? [])
                  .filter(Boolean)
                  .map((error) => ({ message: String(error) }))
                return (
                  <Field data-invalid={errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>API Key</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="off"
                      placeholder={isEdit ? 'Leave empty to keep the current key' : 'sk-...'}
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                    />
                    {isEdit && provider?.has_key ? (
                      <FieldDescription>Current key: •••• {provider.key_last4}</FieldDescription>
                    ) : null}
                    <FieldError errors={errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name="base_url"
              validators={{
                onChange: ({ value }) => fieldError(value ?? '', 'base_url'),
                onSubmit: ({ value }) => fieldError(value ?? '', 'base_url'),
              }}
            >
              {(field) => {
                const errors = (field.state.meta.errors ?? [])
                  .filter(Boolean)
                  .map((error) => ({ message: String(error) }))
                return (
                  <Field data-invalid={errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Base URL</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="url"
                      placeholder="https://api.deepseek.com"
                      value={field.state.value ?? ''}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldDescription>
                      Required for OpenAI Chat providers (e.g. DeepSeek: https://api.deepseek.com,
                      Gemini OpenAI mode). Leave empty for OpenAI/Anthropic.
                    </FieldDescription>
                    <FieldError errors={errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="enabled">
              {(field) => (
                <Field orientation="horizontal">
                  <Switch
                    id={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                  <FieldLabel htmlFor={field.name}>Enabled</FieldLabel>
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
