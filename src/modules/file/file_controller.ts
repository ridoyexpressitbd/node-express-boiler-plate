import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { FileServices } from './file_service'

// upload a file.
const createFile = catchAsync(async (req, res) => {
  const result = await FileServices.uploadFileIntoDB(req.user, req.files)

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'File upload success',
    data: result
  })
})

// upload a file.
const getMyAllFiles = catchAsync(async (req, res) => {
  const result = await FileServices.fetchMyAllFilesFromDB(req.user, req.query)

  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Files retrieved successfully',
    data: result.result,
    meta: result.meta
  })
})

export const FileControllers = { createFile, getMyAllFiles }
