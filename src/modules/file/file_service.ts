import { JwtPayload } from 'jsonwebtoken'
import { Types } from 'mongoose'
import AppError from '../../errors/AppError'
import { User } from '../users/user.model'
import { Owner } from '../owner/owner.model'
import { Store } from '../store/store.model'
import { File } from './file_model'
import { TFile } from './file_interface'
import { TImageAsset } from '../../interface/imageAsset'
import { TVideoAsset } from '../../interface/videoAssest'
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary'
import QueryBuilder from '../../builder/QueryBuilder'
// import { sendVideoToCloudinary } or whichever logic you use for videos

const uploadFileIntoDB = async (user: JwtPayload, files: any) => {
  // 1) Verify the user is valid and not blocked
  await User.isUserBlockedOrDeletedFindBy_id(user.user_id)

  // 2) Find the Owner
  const owner = await Owner.isExistOwnerInDBFindBy_user(user.user_id)
  if (!owner) {
    throw new AppError(404, 'Owner information not found!')
  }

  // 3) Make sure there is a Store for that Owner
  const store = await Store.findOne({ owner: owner._id })
    .select('_id name')
    .lean()
  if (!store) {
    throw new AppError(404, 'Please create a store before uploading files!')
  }

  // 4) Validate that at least images or videos exist in `files`
  //    If you require BOTH images and videos, keep your original check
  if (!files || (!files.images && !files.videos)) {
    throw new AppError(400, 'No files found to upload!')
  }

  // This array will hold all the uploaded document references
  const uploadedFiles: TFile[] = []

  // 5) Handle IMAGES
  if (files.images && Array.isArray(files.images) && files.images.length > 0) {
    for (const fileObj of files.images) {
      // Upload each image to Cloudinary
      const { public_id, optimizeUrl, secure_url } =
        await sendImageToCloudinary(store.name, fileObj.path, 'image')

      // Construct the TFile document
      const imageData: Partial<TFile> = {
        owner: owner._id as Types.ObjectId,
        fileType: 'images',
        image: {
          public_id,
          optimizeUrl,
          secure_url
        } as TImageAsset
      }

      // Save into your DB
      const savedImage = await File.create(imageData)
      uploadedFiles.push(savedImage)
    }
  }

  // 6) Handle VIDEOS
  if (files.videos && Array.isArray(files.videos) && files.videos.length > 0) {
    for (const fileObj of files.videos) {
      const { public_id, secure_url } = await sendImageToCloudinary(
        store.name,
        fileObj.path,
        'video'
      )

      // Construct the TFile document
      const videoData: Partial<TFile> = {
        owner: owner._id as Types.ObjectId,
        fileType: 'videos',
        video: {
          public_id,
          secure_url
        } as TVideoAsset
      }

      // Save into your DB
      const savedVideo = await File.create(videoData)
      uploadedFiles.push(savedVideo)
    }
  }

  // 7) Return all uploaded file records
  return uploadedFiles
}

// fetch my all files.
const fetchMyAllFilesFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>
) => {
  // 1) Verify the user is valid and not blocked
  await User.isUserBlockedOrDeletedFindBy_id(user.user_id)

  // 2) Find the Owner
  const owner = await Owner.isExistOwnerInDBFindBy_user(user.user_id)
  if (!owner) {
    throw new AppError(404, 'Owner information not found!')
  }

  const filesQuery = new QueryBuilder(File.find({ owner: owner._id }), query)
    .sort()
    .filter()
    .fields()
  const result = await filesQuery.modelQuery
  const meta = await filesQuery.countTotal()

  return { result, meta }
}
export const FileServices = { uploadFileIntoDB, fetchMyAllFilesFromDB }
