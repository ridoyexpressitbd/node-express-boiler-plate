import { JwtPayload } from 'jsonwebtoken'
import config from '../config'
import AppError from '../errors/AppError'
import { verifyToken } from '../modules/auth/auth.utils'
import { TUserRole } from '../modules/users/user.interface'
import { User } from '../modules/users/user.model'
import catchAsync from '../utils/catchAsync'

// initiate authentication route auth function
const auth = (...requiredRole: TUserRole[]) => {
  return catchAsync(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]

    // console.log('refresh token from auth guard', req.headers.authorization)

    // if the token is sent from the client.
    if (!token) {
      throw new AppError(401, 'You are not authorized')
    }

    // check if the token is valid.
    const decoded = verifyToken(token, config.jwt_access_token_secret as string)

    const { user_id, role, iat } = decoded

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

    // cheking user role is correct.
    // console.log(user.role, role)
    if (user.role !== role) {
      throw new AppError(403, 'This user role is incoorect!')
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

    // checking requiredRole access or not.
    if (requiredRole && !requiredRole.includes(role)) {
      throw new AppError(401, 'You are not authorized!')
    }

    // set the user to the request object.
    req.user = decoded as JwtPayload

    next()
  })
}

export default auth
