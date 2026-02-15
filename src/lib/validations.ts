import { z } from 'zod'

export const passwordRequirements = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasNumber: /[0-9]/,
  hasSpecial: /[^A-Za-z0-9]/,
}

export const passwordSchema = z
  .string()
  .min(passwordRequirements.minLength, 'Password must be at least 8 characters.')
  .refine((value) => passwordRequirements.hasUppercase.test(value), {
    message: 'Password must contain at least one uppercase letter.',
  })
  .refine((value) => passwordRequirements.hasNumber.test(value), {
    message: 'Password must contain at least one number.',
  })
  .refine((value) => passwordRequirements.hasSpecial.test(value), {
    message: 'Password must contain at least one special character.',
  })

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(80, 'Name must be at most 80 characters.')

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Please provide a valid email address.')

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const signupClientSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean().optional().default(false),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export const updateProfileSchema = z.object({
  name: nameSchema,
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from current password.',
  })

export function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= passwordRequirements.minLength,
    hasUppercase: passwordRequirements.hasUppercase.test(password),
    hasNumber: passwordRequirements.hasNumber.test(password),
    hasSpecial: passwordRequirements.hasSpecial.test(password),
  }
}

export function getPasswordStrength(password: string) {
  if (!password) return 0
  const checks = getPasswordChecks(password)
  const score = Object.values(checks).filter(Boolean).length
  return score
}

export type SignupInput = z.infer<typeof signupSchema>
export type SignupClientInput = z.infer<typeof signupClientSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
