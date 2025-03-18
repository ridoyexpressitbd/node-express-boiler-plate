/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from 'mongoose'
import AppError from '../../errors/AppError'
import { User } from '../users/user.model'
import { TGoogleUser, TJwtPayload, TLoginUser } from './auth.interface'
import {
  createToken,
  generateEmailTemplate,
  generateOTP,
  verifyToken
} from './auth.utils'
import config from '../../config'
import { JwtPayload } from 'jsonwebtoken'
import sendEmail from '../../utils/sendEmail'
import { TEmailFormate } from '../../interface/emailFormat'
import { PasswordReset } from './auth.model'
import bcrypt from 'bcrypt'
import { TUserRole } from '../users/user.interface'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { Owner } from '../owner/owner.model'

const loginUser = async (payload: TLoginUser) => {
  //checking if the user is exits in the database.
  const user = await User.isUserAlreadyExistsBy_email(payload.email)
  if (!user) {
    throw new AppError(404, 'This user is not found!')
  }

  //checking if the user is already deleted.
  const isDeleted = user?.isDeleted
  if (isDeleted) {
    throw new AppError(403, 'This user is deleted!')
  }

  //checking if the user is blocked.
  const userStatus = user?.status
  if (userStatus === 'blocked') {
    throw new AppError(403, 'This user is Blocked')
  }

  // checking user password mached or not.
  const isPasswordMached = await User.isPasswordMached(
    payload.password,
    user.password
  )
  if (!isPasswordMached) {
    throw new AppError(403, 'Password is incorrect!')
  }

  // set jwt payload.
  const jwtPayload: TJwtPayload = {
    user_id: user._id as Types.ObjectId,
    role: user.role
  }

  // create access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string
  )
  // create refresh token.
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string
  )

  return { accessToken, refreshToken }
}

// user change password into db.
const changePasswordIntoDB = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  //checking if the user is exist in the database.
  const _id = userData?.user_id
  const user = await User.findOne({ _id, role: userData?.role }).select(
    '+password'
  )
  if (!user) {
    throw new AppError(404, 'This user is not found!')
  }

  //checking if the user is already deleted .
  const isDeleted = user?.isDeleted
  if (isDeleted) {
    throw new AppError(403, 'This user is already deleted!')
  }

  //checkign if the user is blocked.
  const userStatus = user?.status
  if (userStatus === 'blocked') {
    throw new AppError(403, 'This user is blocked!')
  }

  //checking if the password is matched or not.
  const isPasswordMached = await User.isPasswordMached(
    payload.oldPassword,
    user.password
  )
  if (!isPasswordMached) {
    throw new AppError(400, 'Old password is incorrect!')
  }

  // Ensure the new password is different from the old password
  if (payload.oldPassword === payload.newPassword) {
    throw new AppError(
      400,
      'New password cannot be the same as the old password!'
    )
  }

  // set new password.
  user.password = payload.newPassword
  user.passwordChangedAt = new Date()

  await user.save()

  // set jwt payload for token.
  const jwtPayload: TJwtPayload = {
    user_id: user._id as Types.ObjectId,
    role: user.role
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
}

// create access token by refresh token.
const refreshToken = async (token: string) => {
  // if the token is sent from the client.
  // console.log('refreshToken form service', token)

  if (!token) {
    // throw new AppError(401, 'You are not authorized')
    throw new AppError(401, 'Cookies Missing')
  }

  // check if the token is valid.
  const decoded = verifyToken(token, config.jwt_refresh_token_secret as string)

  const { user_id, iat } = decoded
  //checking if the user is exist in the database
  const user = await User.isUserAlreadyExistsBy_id(user_id)
  if (!user) {
    throw new AppError(404, 'This user is not found!')
  }

  // checking if the user is alrady deleted.
  const isDeleted = user.isDeleted
  if (isDeleted) {
    throw new AppError(403, 'This user is deleted!')
  }
  // checking if the user is blocked
  const userStatus = user.status
  if (userStatus === 'blocked') {
    throw new AppError(403, 'This user is blocked!')
  }

  // checking if the password change time.
  if (user.passwordChangedAt) {
    const isPasswordChanged = User.isJWTIssuedAtBeforePasswordChanged(
      user.passwordChangedAt,
      iat as number
    )
    if (isPasswordChanged) {
      throw new AppError(401, 'You are not authorized!')
    }
  }

  // set jwt payload for token.
  const jwtPayload: TJwtPayload = {
    user_id: user._id as Types.ObjectId,
    role: user.role
  }

  // create a access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string
  )

  return {
    accessToken
  }
}

//forgot password .
const forgotPassword = async (payload: { email: string }) => {
  // checking this user exists in database.
  const user = await User.isUserAlreadyExistsBy_email(payload.email)
  if (!user) {
    throw new AppError(404, 'This user is not found!')
  }

  //checking if the user is already deleted.
  const isDeleted = user?.isDeleted
  if (isDeleted) {
    throw new AppError(403, 'This user is deleted!')
  }

  //checking if the user is blocked.
  const userStatus = user?.status
  if (userStatus === 'blocked') {
    throw new AppError(403, 'This user is Blocked')
  }

  let passwordResetModel = await PasswordReset.findOne({
    email: user.email
  })

  if (!passwordResetModel) {
    passwordResetModel = await PasswordReset.create({ email: payload.email })
  }
  // Check if the user is locked out from requesting OTP
  if (
    passwordResetModel.otpRequestLockUntil &&
    passwordResetModel.otpRequestLockUntil > new Date()
  ) {
    throw new AppError(
      429,
      'Too many OTP requests. Please try again after 1 hour.'
    )
  }

  // Check the OTP request count within the last 10 minutes
  if (
    passwordResetModel.otpRequestCount &&
    passwordResetModel.otpRequestCount >= 3 &&
    passwordResetModel.resetPasswordOTPExpires &&
    passwordResetModel.resetPasswordOTPExpires > new Date()
  ) {
    passwordResetModel.otpRequestLockUntil = new Date(
      Date.now() + 60 * 60 * 1000
    ) // Lock for 1 hour
    passwordResetModel.otpRequestCount = 0
    await passwordResetModel.save()
    throw new AppError(
      429,
      'Too many OTP requests. Please try again after 1 hour.'
    )
  }

  // checking already send otp

  const otp = generateOTP()
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

  passwordResetModel.resetPasswordOTP = otp
  passwordResetModel.resetPasswordOTPExpires = otpExpires

  // Increment OTP request count or reset it if the previous OTP expired
  if (
    !passwordResetModel.otpRequestCount ||
    !passwordResetModel.resetPasswordOTPExpires ||
    passwordResetModel.resetPasswordOTPExpires < new Date()
  ) {
    passwordResetModel.otpRequestCount = 1 // Reset count after OTP expiry
  } else {
    passwordResetModel.otpRequestCount += 1
  }

  await passwordResetModel.save()

  const htmlBody = generateEmailTemplate(otp)

  const emailTemplete: TEmailFormate = {
    emailBody: htmlBody,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${otp}`
  }

  await sendEmail(payload.email, emailTemplete)

  return
}

// verify OTP
const verifyOTP = async (payload: { email: string; otp: string }) => {
  // checking this user exists in database.
  const passwordResetModel = await PasswordReset.findOne({
    email: payload.email
  })
  if (!passwordResetModel) {
    throw new AppError(404, 'Email not found.')
  }

  // Check if the OTP has expired
  if (
    passwordResetModel.resetPasswordOTPExpires &&
    passwordResetModel.resetPasswordOTPExpires < new Date()
  ) {
    throw new AppError(400, 'OTP has expired.')
  }

  // Check if the user is blocked due to too many invalid attempts
  if (
    passwordResetModel.otpLockUntil &&
    passwordResetModel.otpLockUntil > new Date()
  ) {
    throw new AppError(
      429,
      'Too many invalid OTP attempts. Please try again after 1 hour.'
    )
  }

  // Validate the OTP
  if (passwordResetModel.resetPasswordOTP !== payload.otp) {
    // Increment invalid OTP attempts
    passwordResetModel.invalidOtpAttempts =
      (passwordResetModel.invalidOtpAttempts || 0) + 1

    // Lock the user for 1 hour if they exceed 10 invalid attempts
    if (passwordResetModel.invalidOtpAttempts >= 6) {
      passwordResetModel.otpLockUntil = new Date(Date.now() + 60 * 60 * 1000) // 1-hour lock
      passwordResetModel.invalidOtpAttempts = 0 // Reset invalid attempts after lock
    }

    await passwordResetModel.save()
    throw new AppError(400, 'Invalid OTP.')
  }

  // OTP is valid, mark it as verified and reset invalid attempt counters
  passwordResetModel.isOTPVerified = true
  await passwordResetModel.save()
  return
}

//reset Password .
const resetPassword = async (payload: {
  email: string
  newPassword: string
}) => {
  const passwordResetModel = await PasswordReset.findOne({
    email: payload.email
  })

  if (!passwordResetModel || !passwordResetModel.isOTPVerified) {
    throw new AppError(400, 'OTP not verified.')
  }

  const newPasswordHashed = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  )

  // set new password
  const user = await User.findOneAndUpdate(
    { email: payload.email },
    { password: newPasswordHashed, passwordChangedAt: new Date() },
    { new: true }
  )

  // Clean up reset token
  await passwordResetModel.deleteOne({ email: payload.email })

  // set jwt payload.
  const jwtPayload: TJwtPayload = {
    user_id: user?._id as Types.ObjectId,
    role: user?.role as TUserRole
  }

  // create access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string
  )
  // create refresh token.
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string
  )

  return { accessToken, refreshToken }
}

// ========= Social login ===========

// user login by goolge.

const exchangeGoogleCodeForTokens = async (code: string) => {
  const response = await axios.post(
    'https://oauth2.googleapis.com/token',
    null,
    {
      params: {
        code,
        client_id: config.social_login_google_client_id,
        client_secret: config.social_login_google_client_secret,
        redirect_uri: config.social_login_google_redirect_url,
        grant_type: 'authorization_code'
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  )

  if (!response.data) {
    throw new AppError(400, 'Failed to fetch tokens from Google.')
  }

  return response.data // Contains id_token and access_token
}

// get google user.
const getGoogleUser = async (id_token: string): Promise<TGoogleUser> => {
  // check if the token is valid.
  const decoded = jwt.decode(id_token) as any

  if (!decoded || !decoded.email) {
    throw new AppError(400, 'Invalid Google ID token.')
  }
  const { email, name, picture } = decoded

  return {
    email,
    name,
    picture
  }
}
const regesterByGoogle = async (googleUser: TGoogleUser) => {
  let user = await User.findOne({ email: googleUser.email })

  // Register user if not found
  if (!user) {
    user = await User.create({
      email: googleUser.email,
      provider: 'google'
    })
    await Owner.create({
      user: user._id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture
    })
  }
  // set jwt payload.
  const jwtPayload: TJwtPayload = {
    user_id: user._id as Types.ObjectId,
    role: user.role
  }

  // create access token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_token_secret as string,
    config.jwt_access_token_expires_in as string
  )
  // create refresh token.
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_token_secret as string,
    config.jwt_refresh_token_expires_in as string
  )

  return { accessToken, refreshToken }
}

// user login by apple

const regesterByApple = async (payload: string) => {
  const accessToken = ''
  const refreshToken = ''

  return {
    accessToken,
    refreshToken
  }
}
export const AuthServices = {
  loginUser,
  changePasswordIntoDB,
  refreshToken,
  forgotPassword,
  verifyOTP,
  resetPassword,
  regesterByGoogle,
  exchangeGoogleCodeForTokens,
  getGoogleUser,
  regesterByApple
}
