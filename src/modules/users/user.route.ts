import express from 'express'
import validateRequest from '../../middlewares/validateRequest'
import { UserValidation } from './user.validationZodSchema'
import { UserController } from './user.controller'

const router = express.Router()

// user registration or signUP
router.post(
  '/register',
  validateRequest(UserValidation.createUserValidationZodSchema),
  UserController.requestUserRegistration
)
router.post(
  '/register/verify',
  validateRequest(UserValidation.verifyRegistraionOTPValidatonZodSchema),
  UserController.createUser
)

export const UserRoutes = router
