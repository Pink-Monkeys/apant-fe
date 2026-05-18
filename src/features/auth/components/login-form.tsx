import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import { login } from '#/features/auth/api/auth-api'
import { buildLoginPayload, loginFormSchema } from '#/features/auth/schemas/auth-schema'
import type { AuthResponse, LoginPayload } from '#/features/auth/types'
import { setAuthSession } from '#/features/auth/session'
import { getErrorMessage, type ApiErrorEnvelope, type HttpError } from '#/types/http'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string
    password?: string
  }>({})
  const navigate = useNavigate()
  const mutation = useMutation<AuthResponse, HttpError, LoginPayload>({
    mutationFn: login,
    onSuccess: (response) => {
      setFieldErrors({})

      if (response.data?.user) {
        setAuthSession({
          tokenType: response.data.token_type,
          expiresIn: response.data.expires_in,
          user: response.data.user,
        })
      }

      toast.success(response.message ?? 'Login successful')
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
        const identifierError = errors.username?.[0] ?? errors.email?.[0]
        if (identifierError) {
          nextErrors.identifier = identifierError
        }
        if (errors.password?.[0]) {
          nextErrors.password = errors.password[0]
        }
      }

      setFieldErrors(nextErrors)
      toast.error(errorMessage)
    },
  })

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = loginFormSchema.safeParse({ identifier, password })
    if (!result.success) {
      const nextErrors: typeof fieldErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0]
        if (field === 'identifier' || field === 'password') {
          nextErrors[field] = issue.message
        }
      })
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})
    mutation.mutate(buildLoginPayload(result.data.identifier, result.data.password))
  }

  return (
    <div className={cn('flex w-full flex-col gap-6', className)} {...props}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email or username below to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="identifier">Username or email</FieldLabel>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
                {fieldErrors.identifier ? (
                  <FieldDescription className="text-red-600">
                    {fieldErrors.identifier}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {fieldErrors.password ? (
                  <FieldDescription className="text-red-600">
                    {fieldErrors.password}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Logging in...' : 'Login'}
                </Button>

                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link to="/register">Sign up</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
