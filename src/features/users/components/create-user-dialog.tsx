import { useForm } from '@tanstack/react-form'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { createUser, usersQueryKey } from '#/features/users/api/users-api'
import {
  createUserSchema,
  defaultCreateUserValues,
  type CreateUserFormValues,
} from '#/features/users/schemas/users-schema'
import type { CreateUserPayload, ManagedUser, UserRole } from '#/features/users/types'
import { getErrorMessage, type HttpError } from '#/types/http'

type CreateUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'pentester', label: 'Pentester' },
  { value: 'admin', label: 'Admin' },
]

// Creates an account for someone else. Does NOT touch the admin's own session.
export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation<ManagedUser | null, HttpError, CreateUserPayload>({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersQueryKey })
      onOpenChange(false)
      toast.success('User created')
    },
    onError: (err) => {
      toast.error(getErrorMessage(err.data, err.message))
    },
  })

  const form = useForm({
    defaultValues: defaultCreateUserValues,
    onSubmit: async ({ value }) => {
      const result = createUserSchema.safeParse(value)
      if (!result.success) {
        return
      }
      mutation.mutate({
        username: result.data.username,
        email: result.data.email,
        password: result.data.password,
        role: result.data.role,
      })
    },
  })

  const fieldError = <K extends keyof CreateUserFormValues>(
    value: CreateUserFormValues[K],
    key: K
  ) => {
    const result = createUserSchema.shape[key].safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) {
          form.reset()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>Create a new account for another user.</DialogDescription>
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
              name="username"
              validators={{
                onChange: ({ value }) => fieldError(value, 'username'),
                onSubmit: ({ value }) => fieldError(value, 'username'),
              }}
            >
              {(field) => {
                const errors = (field.state.meta.errors ?? [])
                  .filter(Boolean)
                  .map((error) => ({ message: String(error) }))
                return (
                  <Field data-invalid={errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      autoComplete="off"
                      data-1p-ignore
                      data-lpignore="true"
                      placeholder="jane.doe"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError errors={errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => fieldError(value, 'email'),
                onSubmit: ({ value }) => fieldError(value, 'email'),
              }}
            >
              {(field) => {
                const errors = (field.state.meta.errors ?? [])
                  .filter(Boolean)
                  .map((error) => ({ message: String(error) }))
                return (
                  <Field data-invalid={errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="off"
                      placeholder="jane@example.com"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError errors={errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => fieldError(value, 'password'),
                onSubmit: ({ value }) => fieldError(value, 'password'),
              }}
            >
              {(field) => {
                const errors = (field.state.meta.errors ?? [])
                  .filter(Boolean)
                  .map((error) => ({ message: String(error) }))
                return (
                  <Field data-invalid={errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters with a letter and a digit"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                    />
                    <FieldError errors={errors} />
                  </Field>
                )
              }}
            </form.Field>

            <form.Field name="role">
              {(field) => (
                <Field className="w-full">
                  <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as UserRole)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
