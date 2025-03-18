import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import util from 'util'
import { filesUpload } from './file_libs'
import multer from 'multer'
import AppError from '../../errors/AppError'

// Allowed file formats
const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml'
]

const allowedVideoTypes = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/mpeg',
  'video/webm',
  'video/ogg'
]

const unlinkAsync = util.promisify(fs.unlink)

// Suppose we only allow images up to 5MB:
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export const handleFileUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // First, let Multer handle the basic uploading with a 50MB per-file limit:
  filesUpload.fields([{ name: 'images' }, { name: 'videos', maxCount: 3 }])(
    req,
    res,
    async (err: any) => {
      if (err instanceof multer.MulterError) {
        // e.g. LIMIT_FILE_SIZE if > 50MB
        return next(new AppError(400, err.message))
      } else if (err) {
        // Other errors
        return next(new AppError(500, err.message))
      }

      // If Multer didn't throw, let's do manual checks:
      const files = req.files as
        | { [fieldname: string]: Express.Multer.File[] }
        | undefined
      if (!files) {
        // No files uploaded, just proceed:
        return next()
      }

      try {
        // 1) Validate MIME types
        if (
          files.images &&
          files.images.some(file => !allowedImageTypes.includes(file.mimetype))
        ) {
          throw new AppError(400, 'Invalid images file type')
        }

        if (
          files.videos &&
          files.videos.some(file => !allowedVideoTypes.includes(file.mimetype))
        ) {
          throw new AppError(400, 'Invalid videos file type')
        }

        // 2) Check image-file sizes manually (<= 5MB each)
        const allImages = [...(files.images || [])]

        for (const image of allImages) {
          if (image.size > MAX_IMAGE_SIZE) {
            // If the image is too big, remove it immediately and throw error
            await unlinkAsync(image.path).catch(unlinkErr => {
              console.error(
                'Failed to remove oversized image:',
                image.path,
                unlinkErr
              )
            })
            throw new AppError(400, `One of the images exceeds the 5MB limit`)
          }
        }

        // If everything is valid, proceed:
        return next()
      } catch (validationError) {
        // On validation error, remove all uploaded files to avoid partials:
        await Promise.all(
          ['images', 'videos'].flatMap(field =>
            files[field]
              ? files[field].map(file =>
                  unlinkAsync(file.path).catch(unlinkErr => {
                    console.error(
                      'Failed to remove file:',
                      file.path,
                      unlinkErr
                    )
                  })
                )
              : []
          )
        )
        return next(validationError)
      }
    }
  )
}

export const removeUploadedFiles = async (files: any) => {
  await Promise.all(
    ['images', 'videos'].flatMap(field =>
      files[field]
        ? files[field].map((file: Express.Multer.File) =>
            unlinkAsync(file.path).catch(err => {
              console.error('Failed to remove file:', file.path, err)
            })
          )
        : []
    )
  )
}
