import mongoose from 'mongoose'
import { TFile } from './file_interface'
import { ImageSchema, VideoSchema } from '../../schema/file_Schema'

const FileSchema = new mongoose.Schema<TFile>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: [true, 'Owner id is required!']
    },
    fileType: {
      type: String,
      enum: ['images', 'videos'],
      required: [true, 'File type is required!']
    },
    image: {
      type: ImageSchema
    },
    video: {
      type: VideoSchema
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

export const File = mongoose.model<TFile>('File', FileSchema)
