import mongoose from 'mongoose'
import { TUserRole } from '../users/user.interface'

export type TLoginUser = {
  email: string
  password: string
}

export type TJwtPayload = {
  user_id: mongoose.Types.ObjectId
  role: TUserRole
}

export type TPasswordReset = {
  email: string
  resetPasswordOTP?: string
  resetPasswordOTPExpires?: Date
  otpRequestCount?: number
  otpRequestLockUntil?: Date
  invalidOtpAttempts?: number
  otpLockUntil?: Date
  isOTPVerified: boolean
}

export type TGoogleUser = {
  name: string
  email: string
  picture: string
}
