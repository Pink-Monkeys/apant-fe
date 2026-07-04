import { useForm } from '@tanstack/react-form'
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
  defaultResetPasswordValues,
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '#/features/users/schemas/users-schema'
import type { ManagedUser, ResetPasswordPayload } from '#/features/users/types'

type ResetPasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ManagedUser | null
  isSubmitting: boolean
  onSubmit: (id: string, payload: ResetPasswordPayload) => void
}

// Admin sets a user's password directly; no current password required. Mirrors
// the provider-form-dialog wiring (TanStack Form + zod schema).
export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  isSubmitting,
  onSubmit,
}: ResetPasswordDialogProps) {
  const form = useForm({
    defaultValues: defaultResetPasswordValues,
    onSubmit: async ({ value }) => {
      const result = resetPasswordSchema.safeParse(value)
      if (!result.success || !user) {
        return
      }
      onSubmit(user.id, { new_password: result.data.new_password })
    },
  })

  const fieldError = <K extends keyof ResetPasswordFormValues>(
    value: ResetPasswordFormValues[K],
    key: K
  ) => {
    const result = resetPasswordSchema.shape[key].safeParse(value)
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
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for {user?.username ?? 'this user'}. They will need to sign in again.
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
              name="new_password"
              validators={{
                onChange: ({ value }) => fieldError(value, 'new_password'),
                onSubmit: ({ value }) => fieldError(value, 'new_password'),
              }}
            >
              {(field) => {
                const errors = (field.state.meta.errors ?? [])
                  .filter(Boolean)
                  .map((error) => ({ message: String(error) }))
                return (
                  <Field data-invalid={errors.length > 0}>
                    <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
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
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
