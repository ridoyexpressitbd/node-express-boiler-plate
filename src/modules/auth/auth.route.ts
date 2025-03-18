import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { AuthValidation } from './auth.validationZodSchema'
import { AuthController } from './auth.contoller'
import auth from '../../middlewares/auth'

const router = express.Router()

//this route for user login.
router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationZodSchema),
  AuthController.loginUser
)

//user own password change.
router.post(
  '/change-password',
  auth('superAdmin', 'admin', 'user'),
  validateRequest(AuthValidation.changePasswordValidationZodSchema),
  AuthController.changePassword
)

// create user access token by refresh token.
router.post(
  '/refresh-token',
  validateRequest(AuthValidation.refreshTokenBodyValidationZodSchema),
  AuthController.refreshToken
)

//user forgot password.
router.post(
  '/forgot-password',
  validateRequest(AuthValidation.forgotPasswordValidationZodSchema),
  AuthController.forgotPassword
)
router.post(
  '/verify-otp',
  validateRequest(AuthValidation.verifyOTPValidationZodSchema),
  AuthController.verifyOTP
)
router.post(
  '/reset-password',
  validateRequest(AuthValidation.resetPasswordValidationZodSchema),
  AuthController.resetPassword
)

router.get('/google-register', AuthController.googleRegister)
router.get('/google/callback', AuthController.handleGoogleCallback)
// router.post('/apple-regester', AuthController.appleRegister)

// export this routes.
export const AuthRoutes = router
