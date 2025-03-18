/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express'
import { TErrorScouce } from '../interface/errors'
import config from '../config'
import { ZodError } from 'zod'
import handleZodValidationError from '../errors/handleZodValidationError'
import handleMongooseValidationError from '../errors/handleMongooseValidationErro'
import handleMongooseCastError from '../errors/handleMongooseCastError'
import handleMongooseDuplicateError from '../errors/handleMongooseDuplicateError'
import AppError from '../errors/AppError'
import { removeUploadedFiles } from '../modules/file/file_utils'

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Initialize default error details
  let statusCode: number = 500
  let message: string = 'Something went wrong'
  let errorSources: TErrorScouce = [
    {
      path: '',
      message: 'Something went wrong'
    }
  ]

  // Zod validation error handling
  if (err instanceof ZodError) {
    const simplifiedError = handleZodValidationError(err)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorSources = simplifiedError.errorSources
  }

  // Mongoose validation error handling
  else if (err.name === 'ValidationError') {
    const simplifiedError = handleMongooseValidationError(err)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorSources = simplifiedError.errorSources
  }

  // Mongoose cast error handling
  else if (err.name === 'CastError') {
    const simplifiedError = handleMongooseCastError(err)
    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorSources = simplifiedError.errorSources
  }

  // Mongoose Duplicate erorr handling.
  else if (err.code === 11000) {
    const simplifiedError = handleMongooseDuplicateError(err)

    statusCode = simplifiedError.statusCode
    message = simplifiedError.message
    errorSources = simplifiedError.errorSources
  }

  // Custom AppError handling
  else if (err instanceof AppError) {
    statusCode = err?.statusCode
    message = err?.message
    errorSources = [
      {
        path: '',
        message: err?.message
      }
    ]
  }

  // Built-in error handling
  else if (err instanceof Error) {
    message = err?.message
    errorSources = [
      {
        path: '',
        message: err?.message
      }
    ]
  }

  if (req.files) {
    await removeUploadedFiles(req.files)
  }

  return res.status(statusCode).json({
    status: statusCode,
    success: false,
    message,
    error: errorSources,
    stack: config.NODE_ENV === 'development' ? err?.stack : null
  })
}

export default globalErrorHandler
