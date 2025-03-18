import mongoose, { Model, Types } from 'mongoose'
import { USER_ROLE } from './user.constant'

// user role declare
export type TUserRole = keyof typeof USER_ROLE

// this type for user regisgtration data.
export type TUser = {
  _id?: Types.ObjectId
  email: string
  provider: string
  password: string
  role: TUserRole
  status: 'in-progress' | 'blocked'
  passwordChangedAt?: Date
  isDeleted: boolean
}

// create interface.
export interface UserModel extends Model<TUser> {
  isUserAlreadyExistsBy_id(_id: mongoose.Types.ObjectId): Promise<TUser>
  isUserAlreadyExistsBy_email(email: string): Promise<TUser>
  isUserBlockedOrDeletedFindBy_id(
    _id: mongoose.Types.ObjectId
  ): Promise<Record<string, unknown>>
  isPasswordMached(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>

  isJWTIssuedAtBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean
}
