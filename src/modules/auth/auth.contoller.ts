/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../config'
import AppError from '../../errors/AppError'
import catchAsync from '../../utils/catchAsync'
import sendResponse from '../../utils/sendResponse'
import { AuthServices } from './auth.service'

// user login contoller.
const loginUser = catchAsync(async (req, res) => {
  //stored result.
  const result = await AuthServices.loginUser(req.body)

  const { accessToken, refreshToken } = result

  // #Warning : This is Currect method. but its not working in next.js.

  //set refresh token in cookie.
  // res.cookie('refreshToken', refreshToken, {
  //   secure: config.NODE_ENV === 'production',
  //   sameSite: 'strict',
  //   httpOnly: true
  //   // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
  // })
  // send output.

  // #Warning : This method is not the best for refreshToken.
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Login success!',
    data: {
      token: accessToken,
      refreshToken
    }
  })
})

//user change password.
const changePassword = catchAsync(async (req, res) => {
  const result = await AuthServices.changePasswordIntoDB(req.user, req.body)

  const { accessToken, refreshToken } = result

  // #Warning : This is Currect method. but its not working in next.js.

  //set refresh token in cookie.
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true,
  //   sameSite: 'none',
  //   secure: config.NODE_ENV === 'production' || false,
  //   // secure: false,
  //   maxAge: 1000 * 60 * 60 * 24 * 365
  //   // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
  // })

  // #Warning : This method is not the best for refreshToken.
  sendResponse(res, {
    success: true,
    status: 201,
    message: 'Password changed successfully',
    data: {
      token: accessToken,
      refreshToken
    }
  })
})

//create user access token by refresh token.
const refreshToken = catchAsync(async (req, res) => {
  // const token = req.headers.authorization?.split(' ')[3]

  // if (!token) {
  //   throw new AppError(401, 'You are not authorized')
  // }

  // const result = await AuthServices.refreshToken(token)
  // console.log('refresh token form controller', req.body)

  // #Warnig : This method is not the best.
  const result = await AuthServices.refreshToken(req.body.refreshToken)

  // #Warning : This is Currect method. but its not working in next.js.
  // const result = await AuthServices.refreshToken(req.cookies.refreshToken)

  sendResponse(res, {
    status: 201,
    success: true,
    message: 'Token Created Successfully!',
    data: {
      token: result.accessToken
    }
  })
})

// user forgot password.
const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgotPassword(req.body)
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Please check your email and verify with 10 menutes!',
    data: result
  })
})

// user verifyOTP
const verifyOTP = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyOTP(req.body)
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'OTP verified successfully!',
    data: result
  })
})

//user resetPassword
const resetPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.resetPassword(req.body)
  const { accessToken, refreshToken } = result

  // #Warning : This is Currect method. but its not working in next.js.

  //set refresh token in cookie.
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true,
  //   sameSite: 'none',
  //   secure: config.NODE_ENV === 'production' || false,
  //   // secure: false,
  //   maxAge: 1000 * 60 * 60 * 24 * 365
  //   // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
  // })

  // #Warning : This method is not the best for refreshToken.
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Password reset successfully!',
    data: {
      token: accessToken,
      refreshToken
    }
  })
})

//======== social login==========

//user goolge regester.

// Redirect to Google Auth
const googleRegister = catchAsync(async (req, res) => {
  // console.log('user stay in google register controller')
  const googleAuthURL = `${config.social_login_google_oauth2_url}?client_id=${config.social_login_google_client_id}&redirect_uri=${config.social_login_google_redirect_url}&response_type=code&scope=openid%20email%20profile`
  res.redirect(googleAuthURL)
})

// handle google callbake.

const handleGoogleCallback = catchAsync(async (req, res): Promise<any> => {
  // console.log(req.query)
  const code = req.query.code as string
  if (!code) {
    throw new AppError(400, 'Authorization code is missing.')
  }

  // Exchange code for token and fetch user data
  const tokens = await AuthServices.exchangeGoogleCodeForTokens(code as string)

  if (!tokens.id_token) {
    throw new AppError(400, 'Invalid token received from Google.')
  }

  const userData = await AuthServices.getGoogleUser(tokens.id_token)

  if (!userData.email) {
    throw new AppError(400, 'Failed to retrieve user information.')
  }
  const result = await AuthServices.regesterByGoogle(userData)

  const { accessToken, refreshToken } = result

  // console.log(
  //   'user stay in Handle Google CallBack controller',
  //   code,
  //   userData,
  //   'access token',
  //   accessToken,
  //   'refresh token',
  //   refreshToken
  // )
  // #Warning : This is Currect method. but its not working in next.js.

  //set refresh token in cookie.
  // res.cookie('refreshToken', refreshToken, {
  //   httpOnly: true,
  //   sameSite: 'none',
  //   secure: config.NODE_ENV === 'production' || false,
  //   // secure: false,
  //   maxAge: 1000 * 60 * 60 * 24 * 365
  //   // expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365)
  // })

  // send output.
  // #Warning : This method is not the best for refreshToken.
  return res.send(`
    <html>
      <body>
        <script>
          // পপআপ-উইন্ডোর স্কোপে এই স্ক্রিপ্ট রান হবে:
          window.opener.postMessage({
            data: {
              token: "${accessToken}",
              refreshToken: "${refreshToken}"
            }
          }, "*");
          window.close();
        </script>
      </body>
    </html>
  `)
})

//user goolge regester.
const appleRegister = catchAsync(async (req, res) => {
  //stored result.
  const result = await AuthServices.regesterByApple(req.body)

  const { accessToken, refreshToken } = result

  //set refresh token in cookie.
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true
  })

  // send output.
  sendResponse(res, {
    status: 200,
    success: true,
    message: 'Login success!',
    data: {
      token: accessToken
    }
  })
})
export const AuthController = {
  loginUser,
  changePassword,
  refreshToken,
  forgotPassword,
  verifyOTP,
  resetPassword,
  googleRegister,
  handleGoogleCallback,
  appleRegister
}
