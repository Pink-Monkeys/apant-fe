import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { changePassword } from '#/features/auth/api/auth-api'
import { getAuthSession, setAuthSession } from '#/features/auth/session'
import type { AuthResponse, ChangePasswordPayload } from '#/features/auth/types'
import { changePasswordFormSchema } from '#/features/settings/schemas/settings-schema'
import { getErrorMessage, type HttpError } from '#/types/http'

type PasswordErrors = {
  current_password?: string
  new_password?: string
  confirm_password?: string
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<PasswordErrors>({})

  const mutation = useMutation<AuthResponse, HttpError, ChangePasswordPayload>({
    mutationFn: changePassword,
    onSuccess: (response) => {
      // BE rotates the session cookie for this device; keep the user logged in
      // and just refresh the stored session metadata.
      const data = response.data
      if (data?.user) {
        setAuthSession({
          tokenType: data.token_type ?? getAuthSession()?.tokenType,
          expiresIn: data.expires_in ?? getAuthSession()?.expiresIn,
          user: data.user,
        })
      }
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
      toast.success(response.message ?? 'Password changed')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    const result = changePasswordFormSchema.safeParse({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    })
    if (!result.success) {
      const next: PasswordErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if (
          (key === 'current_password' || key === 'new_password' || key === 'confirm_password') &&
          !next[key]
        ) {
          next[key] = issue.message
        }
      }
      setErrors(next)
      return
    }

    setErrors({})
    mutation.mutate({
      current_password: result.data.current_password,
      new_password: result.data.new_password,
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.current_password)}>
          <FieldLabel htmlFor="current-password">Current password</FieldLabel>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            autoComplete="current-password"
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
          {errors.current_password ? (
            <FieldError errors={[{ message: errors.current_password }]} />
          ) : null}
        </Field>
        <Field data-invalid={Boolean(errors.new_password)}>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            autoComplete="new-password"
            onChange={(event) => setNewPassword(event.target.value)}
          />
          {errors.new_password ? <FieldError errors={[{ message: errors.new_password }]} /> : null}
        </Field>
        <Field data-invalid={Boolean(errors.confirm_password)}>
          <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {errors.confirm_password ? (
            <FieldError errors={[{ message: errors.confirm_password }]} />
          ) : null}
        </Field>
        <Field>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Updating...' : 'Change password'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
