import mongoose from 'mongoose'
import { TErrorScouce, TGenericErrorResponse } from '../interface/errors'

const handleMongooseValidationError = (
  err: mongoose.Error.ValidationError
): TGenericErrorResponse => {
  const errorSources: TErrorScouce = Object.values(err.errors).map(
    (val: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: val?.path,
        message: val?.message
      }
    }
  )

  const statusCode = 400
  const message = 'Validation Error'
  return {
    statusCode,
    message,
    errorSources
  }
}

export default handleMongooseValidationError
