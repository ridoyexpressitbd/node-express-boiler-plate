import { Types } from 'mongoose'
import { TImageAsset } from '../../interface/imageAsset'
import { TVideoAsset } from '../../interface/videoAssest'

export type TFile = {
  _id?: Types.ObjectId
  owner?: Types.ObjectId
  image?: TImageAsset
  video?: TVideoAsset
  fileType: 'images' | 'videos'
  isActive: boolean
  isDeleted: boolean
}
