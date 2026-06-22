import { z } from 'zod'

// FE validation kept in line with the backend contract.
export const profileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be 3-32 characters')
    .max(32, 'Username must be 3-32 characters')
    .regex(/^[a-z0-9_.-]+$/, 'Use lowercase letters, numbers, dot, underscore, or hyphen'),
  email: z.string().trim().email('Invalid email'),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export const changePasswordFormSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'New password must be 8-72 characters')
      .max(72, 'New password must be 8-72 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: 'New password must differ from the current one',
    path: ['new_password'],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>
