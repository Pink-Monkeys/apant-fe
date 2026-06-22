import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { meQueryKey, updateProfile } from '#/features/auth/api/auth-api'
import { getAuthSession, setAuthSession } from '#/features/auth/session'
import type { MeResponse, UpdateProfilePayload } from '#/features/auth/types'
import { profileFormSchema } from '#/features/settings/schemas/settings-schema'
import { getErrorMessage, type HttpError } from '#/types/http'

type ProfileFormProps = {
  defaultUsername: string
  defaultEmail: string
}

type ProfileErrors = { username?: string; email?: string }

export function ProfileForm({ defaultUsername, defaultEmail }: ProfileFormProps) {
  const queryClient = useQueryClient()
  const [username, setUsername] = useState(defaultUsername)
  const [email, setEmail] = useState(defaultEmail)
  const [errors, setErrors] = useState<ProfileErrors>({})

  const mutation = useMutation<MeResponse, HttpError, UpdateProfilePayload>({
    mutationFn: updateProfile,
    onSuccess: (response) => {
      const user = response.data?.user
      if (user) {
        const current = getAuthSession()
        setAuthSession({ tokenType: current?.tokenType, expiresIn: current?.expiresIn, user })
      }
      queryClient.invalidateQueries({ queryKey: meQueryKey })
      toast.success(response.message ?? 'Profile updated')
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (mutation.isPending) return

    const result = profileFormSchema.safeParse({ username, email })
    if (!result.success) {
      const next: ProfileErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0]
        if ((key === 'username' || key === 'email') && !next[key]) {
          next[key] = issue.message
        }
      }
      setErrors(next)
      return
    }

    setErrors({})
    mutation.mutate(result.data)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.username)}>
          <FieldLabel htmlFor="profile-username">Username</FieldLabel>
          <Input
            id="profile-username"
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />
          {errors.username ? <FieldError errors={[{ message: errors.username }]} /> : null}
        </Field>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="profile-email">Email</FieldLabel>
          <Input
            id="profile-email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email ? <FieldError errors={[{ message: errors.email }]} /> : null}
        </Field>
        <Field>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
