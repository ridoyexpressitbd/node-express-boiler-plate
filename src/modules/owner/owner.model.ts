import mongoose from 'mongoose'
import { OwnerModel, TOwner } from './owner.interface'

const OwnerSchema = new mongoose.Schema<TOwner, OwnerModel>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required!'],
      unique: true,
      ref: 'User'
    },
    email: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String
    },
    phone: {
      type: String
    },
    picture: {
      type: String
    }
  },
  {
    timestamps: true
  }
)
// statics method for search client in db.
OwnerSchema.statics.isExistOwnerInDBFindBy_user = async function (
  user: string
) {
  return await Owner.findOne({ user })
}
export const Owner = mongoose.model<TOwner, OwnerModel>('Owner', OwnerSchema)
