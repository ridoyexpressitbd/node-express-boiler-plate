/* eslint-disable @typescript-eslint/no-explicit-any */
import { TErrorScouce, TGenericErrorResponse } from '../interface/errors'

const handleMongooseDuplicateError = (err: any): TGenericErrorResponse => {
  const match = err.message.match(/dup key: \{\s*([^:]+):\s*"([^"]+)"\s*\}/)
  const fieldName = match?.[1]?.trim() || 'unknown_field'
  const fieldValue = match?.[2]?.trim() || 'unknown_value'

  const errorSources: TErrorScouce = [
    {
      path: fieldName || '',
      message: fieldValue
        ? `${fieldValue} is Already exists!`
        : 'Duplicate Error'
    }
  ]

  const statusCode = 409
  const message = 'Duplicate Error'

  return {
    statusCode,
    message,
    errorSources
  }
}

export default handleMongooseDuplicateError
