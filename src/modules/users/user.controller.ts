import config from '../../config'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { UserServices } from './user.service'

// create user controller.
const requestUserRegistration = catchAsync(async (req, res) => {
  await UserServices.requestUserRegistrationIntoDB(req.body.email)
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'OTP sent to your email. Please verify to complete registration.',
    data: null
  })
})

const createUser = catchAsync(async (req, res) => {
  // store result.
  const result = await UserServices.createUserIntoDB(req.body.otp, req.body)
  const { accessToken, refreshToken } = result

  // #Warning : This is Currect method. but its not working in next.js.

  //set refresh token in cookie.
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: false,
  //   sameSite: 'none',
  //   secure: config.NODE_ENV === 'production' || false,
  //   // secure: false,
  //   maxAge: 1000 * 60 * 60 * 24 * 365
  //   // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
  // })

  // send output or result.
  // #Warning : This method is not the best for refreshToken.
  sendResponse(res, {
    status: 201,
    success: true,
    message: 'User is created Successfully',
    data: {
      token: accessToken,
      refreshToken
    }
  })
})

export const UserController = {
  createUser,
  requestUserRegistration
}
