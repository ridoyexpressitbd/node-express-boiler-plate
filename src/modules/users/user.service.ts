/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose'
import config from '../../config'
import AppError from '../../errors/AppError'
import { TJwtPayload } from '../auth/auth.interface'
import {
  createToken,
  generateEmailTemplate,
  generateOTP
} from '../auth/auth.utils'
import { TOwner } from '../owner/owner.interface'
import { Owner } from '../owner/owner.model'
import { TUser } from './user.interface'
import { User } from './user.model'
import { PasswordReset } from '../auth/auth.model'
import { TEmailFormate } from '../../interface/emailFormat'
import sendEmail from '../../utils/sendEmail'
import { AuthServices } from '../auth/auth.service'

// create a user into db.

// email varification by OTP
const requestUserRegistrationIntoDB = async (email: string) => {
  //checking , user already exists or not.
  if (await User.isUserAlreadyExistsBy_email(email)) {
    throw new AppError(400, 'This user already exists!')
  }

  let emailVarificationModel = await PasswordReset.findOne({
    email
  })

  if (!emailVarificationModel) {
    emailVarificationModel = await PasswordReset.create({ email })
  }
  // Check if the user is locked out from requesting OTP
  if (
    emailVarificationModel.otpRequestLockUntil &&
    emailVarificationModel.otpRequestLockUntil > new Date()
  ) {
    throw new AppError(
      429,
      'Too many OTP requests. Please try again after 1 hour.'
    )
  }

  // Check the OTP request count within the last 10 minutes
  if (
    emailVarificationModel.otpRequestCount &&
    emailVarificationModel.otpRequestCount >= 3 &&
    emailVarificationModel.resetPasswordOTPExpires &&
    emailVarificationModel.resetPasswordOTPExpires > new Date()
  ) {
    emailVarificationModel.otpRequestLockUntil = new Date(
      Date.now() + 60 * 60 * 1000
    ) // Lock for 1 hour
    emailVarificationModel.otpRequestCount = 0
    await emailVarificationModel.save()
    throw new AppError(
      429,
      'Too many OTP requests. Please try again after 1 hour.'
    )
  }

  // checking already send otp

  const otp = generateOTP()
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

  emailVarificationModel.resetPasswordOTP = otp
  emailVarificationModel.resetPasswordOTPExpires = otpExpires

  // Increment OTP request count or reset it if the previous OTP expired
  if (
    !emailVarificationModel.otpRequestCount ||
    !emailVarificationModel.resetPasswordOTPExpires ||
    emailVarificationModel.resetPasswordOTPExpires < new Date()
  ) {
    emailVarificationModel.otpRequestCount = 1 // Reset count after OTP expiry
  } else {
    emailVarificationModel.otpRequestCount += 1
  }

  const htmlBody = generateEmailTemplate(otp)

  const emailTemplete: TEmailFormate = {
    emailBody: htmlBody,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${otp}`
  }

  await sendEmail(email, emailTemplete)
  await emailVarificationModel.save()

  return
}

const createUserIntoDB = async (otp: string, payload: TUser) => {
  //checking , user already exists or not.
  if (await User.isUserAlreadyExistsBy_email(payload.email)) {
    throw new AppError(400, 'This user already exists!')
  }

  await AuthServices.verifyOTP({ email: payload.email, otp })

  const emailVarifyModel = await PasswordReset.findOne({
    email: payload.email
  })

  if (!emailVarifyModel || !emailVarifyModel.isOTPVerified) {
    throw new AppError(400, 'Email not verified.')
  }

  const ownerData: Partial<TOwner> = {}
  //create a session
  const session = await mongoose.startSession()

  try {
    //start session.
    session.startTransaction()

    //apply transaction 1
    const newUser = await User.create([payload], { session })

    if (!newUser.length) {
      throw new AppError(400, 'Failed to Create User')
    }

    //set client information from user data.
    ownerData.user = newUser[0]._id
    ownerData.email = newUser[0].email

    //apply transaction 2
    const newClient = await Owner.create([ownerData], { session })
    if (!newClient.length) {
      throw new AppError(400, 'Failed to Create User')
    }

    // transaction success then data save.
    await session.commitTransaction()
    // Clean up reset token
    await emailVarifyModel.deleteOne({ email: payload.email })

    // set jwt payload for token.
    const jwtPayload: TJwtPayload = {
      user_id: newUser[0]._id,
      role: newUser[0].role
    }

    // create a access token
    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_token_secret as string,
      config.jwt_access_token_expires_in as string
    )

    //create a refresh token
    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_token_secret as string,
      config.jwt_refresh_token_expires_in as string
    )

    //return access and refresh token.
    return { accessToken, refreshToken }
  } catch (err: any) {
    //session cancel.
    await session.abortTransaction()
    throw new AppError(400, err.message)
  } finally {
    //end session
    await session.endSession()
  }
}

export const UserServices = {
  createUserIntoDB,
  requestUserRegistrationIntoDB
}
