import express from 'express'
import { FileControllers } from './file_controller'
import auth from '../../middlewares/auth'
import { handleFileUpload } from './file_utils'

const router = express.Router()

// upload file.
router.post(
  '/upload',
  auth('user'),
  handleFileUpload,
  FileControllers.createFile
)

// fetch files.
router.get('/', auth('user'), FileControllers.getMyAllFiles)

export const FileRoutes = router
