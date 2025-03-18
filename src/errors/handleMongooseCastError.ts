import mongoose from 'mongoose'
import { TErrorScouce, TGenericErrorResponse } from '../interface/errors'

const handleMongooseCastError = (
  err: mongoose.Error.CastError
): TGenericErrorResponse => {
  const errorSources: TErrorScouce = [
    {
      path: err?.path,
      message: err?.message
    }
  ]

  const statusCode = 400
  const message = 'Invalid ID'

  return {
    statusCode,
    message,
    errorSources
  }
}

export default handleMongooseCastError
