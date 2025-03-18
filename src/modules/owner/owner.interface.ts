import mongoose, { Model, Types } from 'mongoose'

export type TOwner = {
  _id?: Types.ObjectId
  user: Types.ObjectId
  email: string
  name?: string
  phone?: string
  picture?: string
}

// create interface.
export interface OwnerModel extends Model<TOwner> {
  isExistOwnerInDBFindBy_user(user: mongoose.Types.ObjectId): Promise<TOwner>
}
