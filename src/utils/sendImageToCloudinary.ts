/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from 'cloudinary'

import multer from 'multer'
import fs from 'fs'
import AppError from '../errors/AppError'
import config from '../config'
import { generateOTP } from '../modules/auth/auth.utils'

// Configuration
cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret
})

export const sendImageToCloudinary = async (
  fileName: string,
  path: string,
  resource_type: 'image' | 'video' = 'image'
): Promise<Record<string, unknown>> => {
  const uniqueNumber = generateOTP()
  // Upload an image
  try {
    const uploadResult = await cloudinary.uploader.upload(path, {
      public_id: `${fileName}${uniqueNumber}`,
      resource_type
    })

    // Optimize delivery by resizing and applying auto-format and auto-quality
    let optimizeUrl = ''
    if (resource_type === 'image') {
      optimizeUrl = cloudinary.url(fileName, {
        fetch_format: 'auto',
        quality: 'auto'
      })
    }

    //remove the local file after upload.
    fs.unlink(path, (err: any) => {
      if (err) {
        throw new Error('File removing Faield!')
      }
    })

    return { ...uploadResult, optimizeUrl }
  } catch (err: any) {
    throw new AppError(err?.http_code, err?.message)
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'image') {
      cb(null, process.cwd() + '/uploads/images')
    } else if (file.fieldname === 'video') {
      cb(null, process.cwd() + '/uploads/videos')
    } else {
      cb(new Error('Invalid Filed name'), 'false')
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

export const upload = multer({ storage: storage })
