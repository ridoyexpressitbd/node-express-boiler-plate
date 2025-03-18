import { z } from 'zod'

const createUserValidationZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required!' })
      .email('Invalid Email Format!'),
    password: z
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

const verifyRegistraionOTPValidatonZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required!' })
      .email('Invalid Email Format!'),

    otp: z
      .string({ required_error: 'OTP is required!' })
      .length(6, { message: 'OTP must be exactly 6 digits!' })
      .regex(/^\d+$/, 'OTP must contain only numeric characters!'),
    password: z
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

export const UserValidation = {
  createUserValidationZodSchema,
  verifyRegistraionOTPValidatonZodSchema
}
