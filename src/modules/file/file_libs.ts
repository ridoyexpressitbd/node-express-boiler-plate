import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'
import AppError from '../../errors/AppError'

// If your max allowed video size is 50MB:
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

// Ensure directory exists before saving
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    let uploadPath: string

    if (file.fieldname === 'videos') {
      uploadPath = path.join(process.cwd(), 'uploads/videos')
    } else if (file.fieldname === 'images') {
      uploadPath = path.join(process.cwd(), 'uploads/images')
    } else {
      return cb(new AppError(400, 'Invalid field name'), '')
    }

    ensureDirectoryExists(uploadPath)
    cb(null, uploadPath)
  },

  filename: (req: Request, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  }
})

// This Multer config sets the *global* file-size limit to 50MB
export const filesUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }
})
