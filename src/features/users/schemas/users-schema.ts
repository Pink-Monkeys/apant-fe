import { z } from 'zod'

export const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(8, 'Password must be 8-72 characters')
    .max(72, 'Password must be 8-72 characters')
    .regex(/[a-zA-Z]/, 'Must contain a letter')
    .regex(/[0-9]/, 'Must contain a digit'),
})

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const defaultResetPasswordValues: ResetPasswordFormValues = {
  new_password: '',
}

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be 3-32 characters')
    .max(32, 'Username must be 3-32 characters')
    .regex(/^[a-z0-9_.-]+$/, 'Only a-z 0-9 _ . - allowed'),
  email: z.string().trim().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be 8-72 characters')
    .max(72, 'Password must be 8-72 characters')
    .regex(/[a-zA-Z]/, 'Must contain a letter')
    .regex(/[0-9]/, 'Must contain a digit'),
  role: z.enum(['admin', 'pentester']),
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const defaultCreateUserValues: CreateUserFormValues = {
  username: '',
  email: '',
  password: '',
  role: 'pentester',
}
