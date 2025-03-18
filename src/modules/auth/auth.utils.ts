/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken'
import { TJwtPayload } from './auth.interface'
import AppError from '../../errors/AppError'

// jwt token create.
export const createToken = (
  jwtPayload: TJwtPayload,
  jwtSecrect: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, jwtSecrect, { expiresIn })
}

// jwt token verify funtion
export const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    return decoded
  } catch (err: any) {
    throw new AppError(401, err.message || 'Invalid or expired token!')
  }
}

// Generate a 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// create html body for verify otp code.
export const generateEmailTemplate = (code: string): string => {
  return `
 <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #333;">
  <div style="text-align: center; padding: 20px;">
    <img
      src="https://res.cloudinary.com/dmoxym9g7/image/upload/v1737617899/WhatsApp_Image_2025-01-23_at_2.36.35_AM_isibvr.jpg"
      alt="Logo"
      style="width: 150px; margin-bottom: 20px;"
    >
  </div>
  <h2 style="text-align: center;">Your Verification Code!</h2>
  <p style="text-align: center;">
    This code is valid for the next 10 minutes.
  </p>
  <div
    style="
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: #f4f4f4;
      padding: 10px;
      border-radius: 5px;
      width: fit-content;
      margin: 20px auto 5px auto;
      letter-spacing: 20px;
    "
  >
    <strong style="font-size: 34px; color: #333;">${code}</strong>
  </div>

 <div>
 </div>
</div>


  `
}
