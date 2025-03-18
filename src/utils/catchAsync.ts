import { NextFunction, Request, RequestHandler, Response } from 'express'

// Utility to catch asynchronous errors in Express route handlers
const catchAsync = (fn: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(err => next(err))
  }
}

export default catchAsync
