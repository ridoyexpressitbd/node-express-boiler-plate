import { z } from 'zod'
const loginValidationZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid Email Format!'),
    password: z.string({ required_error: 'Password is required' })
  })
})

const changePasswordValidationZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({ required_error: 'Old password is required!' }),
    newPassword: z
      .string({ required_error: 'Password is required!' })
      .superRefine((password, ctx) => {
        if (password.length < 8 || password.length > 20) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must be between 8 and 20 characters long.'
          })
        }
        if (!/[a-z]/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must include at least one lowercase letter.'
          })
        }
        if (!/[A-Z]/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must include at least one uppercase letter.'
          })
        }
        if (!/\d/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must include at least one number.'
          })
        }
        if (!/[@$!%*?&]/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Password must include at least one special character (@, $, !, %, *, ?, &).'
          })
        }
      })
  })
})

const refreshTokenCookiesValidationZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required!' })
  })
})

const refreshTokenBodyValidationZodSchema = z.object({
  body: z.object({
    refreshToken: z.string({ required_error: 'Refresh token is required!' })
  })
})

const forgotPasswordValidationZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required!' })
      .email('Invalid Email Format!')
  })
})

const verifyOTPValidationZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required!' })
      .email('Invalid Email Format!'),

    otp: z
      .string({ required_error: 'OTP is required!' })
      .length(6, { message: 'OTP must be exactly 6 digits!' })
      .regex(/^\d+$/, 'OTP must contain only numeric characters!')
  })
})

const resetPasswordValidationZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required!' })
      .email('Invalid Email Format!'),
    newPassword: z
      .string({ required_error: 'Password is required!' })
      .superRefine((password, ctx) => {
        if (password.length < 8 || password.length > 20) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must be between 8 and 20 characters long.'
          })
        }
        if (!/[a-z]/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must include at least one lowercase letter.'
          })
        }
        if (!/[A-Z]/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must include at least one uppercase letter.'
          })
        }
        if (!/\d/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Password must include at least one number.'
          })
        }
        if (!/[@$!%*?&]/.test(password)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              'Password must include at least one special character (@, $, !, %, *, ?, &).'
          })
        }
      })
  })
})
export const AuthValidation = {
  loginValidationZodSchema,
  changePasswordValidationZodSchema,
  refreshTokenCookiesValidationZodSchema,
  refreshTokenBodyValidationZodSchema,
  forgotPasswordValidationZodSchema,
  verifyOTPValidationZodSchema,
  resetPasswordValidationZodSchema
}
