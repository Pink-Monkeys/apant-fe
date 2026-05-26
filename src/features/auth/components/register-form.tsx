import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import { register } from '#/features/auth/api/auth-api'
import { registerFormSchema } from '#/features/auth/schemas/auth-schema'
import type { AuthResponse, RegisterPayload } from '#/features/auth/types'
import { setAuthSession } from '#/features/auth/session'
import { getErrorMessage, type ApiErrorEnvelope, type HttpError } from '#/types/http'

export function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})
  const navigate = useNavigate()
  const mutation = useMutation<AuthResponse, HttpError, RegisterPayload>({
    mutationFn: register,
    onSuccess: (response) => {
      setFieldErrors({})

      if (response.data?.user) {
        setAuthSession({
          tokenType: response.data.token_type,
          expiresIn: response.data.expires_in,
          user: response.data.user,
        })
      }

      toast.success(response.message ?? 'Registration successful')
      navigate({ to: '/dashboard' })
    },
    onError: (error) => {
      const nextErrors: typeof fieldErrors = {}
      const data = error.data as ApiErrorEnvelope | undefined
      const nestedMessage =
        data && typeof data === 'object' && 'error' in data
          ? (data as { error?: { message?: string } }).error?.message
          : undefined
      const errorMessage =
        typeof nestedMessage === 'string' && nestedMessage.length > 0
          ? nestedMessage
          : getErrorMessage(data, error.message)

      if (data && typeof data === 'object' && data.errors && !Array.isArray(data.errors)) {
        const errors = data.errors as Record<string, string[]>
        if (errors.username?.[0]) {
          nextErrors.username = errors.username[0]
        }
        if (errors.email?.[0]) {
          nextErrors.email = errors.email[0]
        }
        if (errors.password?.[0]) {
          nextErrors.password = errors.password[0]
        }
        if (errors.confirmPassword?.[0]) {
          nextErrors.confirmPassword = errors.confirmPassword[0]
        }
      }

      setFieldErrors(nextErrors)
      toast.error(errorMessage)
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = registerFormSchema.safeParse({
      username,
      email,
      password,
      confirmPassword,
    })

    if (!result.success) {
      const nextErrors: typeof fieldErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (
          field === 'username' ||
          field === 'email' ||
          field === 'password' ||
          field === 'confirmPassword'
        ) {
          nextErrors[field] = issue.message
        }
      })
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    mutation.mutate({
      username: result.data.username,
      email: result.data.email,
      password: result.data.password,
    })
  }

  return (
    <div className={cn('flex w-full flex-col gap-6', className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Fill in the details below to set up your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="pinkmonkeys"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
                {fieldErrors.username ? (
                  <FieldDescription className="text-destructive">
                    {fieldErrors.username}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="youremail@email.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {fieldErrors.email ? (
                  <FieldDescription className="text-destructive">
                    {fieldErrors.email}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {fieldErrors.password ? (
                  <FieldDescription className="text-destructive">
                    {fieldErrors.password}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {fieldErrors.confirmPassword ? (
                  <FieldDescription className="text-destructive">
                    {fieldErrors.confirmPassword}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Registering...' : 'Register'}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link to="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
