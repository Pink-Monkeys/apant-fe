import { z } from 'zod'

import type { LoginPayload } from '#/features/auth/types'

const emailSchema = z.string().email('Invalid email')

export const loginFormSchema = z.object({
  identifier: z.string().min(1, 'Username or email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerFormSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export function buildLoginPayload(identifier: string, password: string): LoginPayload {
  const emailResult = emailSchema.safeParse(identifier)

  if (emailResult.success) {
    return { email: emailResult.data, password }
  }

  return { username: identifier, password }
}
