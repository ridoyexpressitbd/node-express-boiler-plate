import { Response } from 'express'
type TMeta = {
  page: number
  limit: number
  totalData: number
  totalPage: number
}

type TSendResponse<T> = {
  status: number
  success: boolean
  message?: string
  meta?: TMeta
  data: T
}

const sendResponse = <T>(res: Response, data: TSendResponse<T>) => {
  return res.status(data.status).json({
    status: data.status,
    success: data.success,
    message: data.message,
    meta: data.meta,
    data: data.data
  })
}

export default sendResponse
