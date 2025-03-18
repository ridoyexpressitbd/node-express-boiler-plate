import mongoose from 'mongoose'
import { TPasswordReset } from './auth.interface'

const PasswordResetSchema = new mongoose.Schema<TPasswordReset>({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
    trim: true
  },
  resetPasswordOTP: {
    type: String
  },
  resetPasswordOTPExpires: {
    type: Date
  },
  otpRequestCount: {
    type: Number,
    default: 0
  },
  otpRequestLockUntil: {
    type: Date
  },
  invalidOtpAttempts: {
    type: Number,
    default: 0
  },
  otpLockUntil: {
    type: Date
  },
  isOTPVerified: {
    type: Boolean,
    default: false
  }
})

export const PasswordReset = mongoose.model<TPasswordReset>(
  'PasswordReset',
  PasswordResetSchema
)
