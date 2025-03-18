import { v2 as cloudinary } from 'cloudinary'
import config from '../config'

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret
})

export const deleteImageFromCloudinary = async (
  publicId: string,
  resource_type: 'image' | 'video' = 'image'
) => {
  try {
    // Assuming cloudinary is configured
    await cloudinary.uploader.destroy(publicId, {
      resource_type
    })
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
  }
}
