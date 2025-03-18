import { ZodError, ZodIssue } from 'zod'
import { TGenericErrorResponse } from '../interface/errors'

const handleZodValidationError = (error: ZodError): TGenericErrorResponse => {
  const errorSources = error.issues.map((issues: ZodIssue) => {
    return {
      path: issues?.path[issues.path.length - 1],
      message: issues.message
    }
  })

  const statusCode = 400
  const message = 'Validation Error'

  return {
    statusCode,
    message,
    errorSources
  }
}

export default handleZodValidationError
