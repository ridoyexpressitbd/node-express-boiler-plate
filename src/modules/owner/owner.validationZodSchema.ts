import { z } from 'zod'
const createOwnerValidationZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required!' }).optional(),
    email: z
      .string({ required_error: 'Email is required!' })
      .email()
      .optional(),
    phone: z.string({ required_error: 'Phone is required!' }).optional()
  })
})

export const ownerValidation = {
  createOwnerValidationZodSchema
}
