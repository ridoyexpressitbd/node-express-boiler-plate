import mongoose from 'mongoose'
import { TUser, UserModel } from './user.interface'
import { UserRole, UserStatus } from './user.constant'
import bcrypt from 'bcrypt'
import config from '../../config'
import AppError from '../../errors/AppError'

const UserSchema = new mongoose.Schema<TUser, UserModel>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      trim: true
    },
    provider: {
      type: String,
      default: 'email'
    },
    password: {
      type: String,
      required: function (this: TUser) {
        return this.provider === 'email' // Password is required only for "email" provider
      },
      select: 0
    },
    passwordChangedAt: {
      type: Date
    },
    role: {
      type: String,
      enum: UserRole,
      default: 'user'
    },
    status: {
      type: String,
      enum: UserStatus,
      default: 'in-progress'
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

//statics methods for user already Exists by _id / mongodb default _id
UserSchema.statics.isUserAlreadyExistsBy_id = async function (_id: string) {
  const result = await User.findById(_id).select('+password')
  return result
}

//statics methods for user already Exists by email
UserSchema.statics.isUserAlreadyExistsBy_email = async function (
  email: string
) {
  const result = await User.findOne({ email }).select('+password')
  return result
}
// statics methods for user blocked or deleted .
UserSchema.statics.isUserBlockedOrDeletedFindBy_id = async function (
  _id: string
) {
  const user = await User.findById(_id)
  if (!user) {
    throw new AppError(404, 'This user is not found!')
  }

  if (user.status === 'blocked') {
    throw new AppError(403, 'This user is already blocked!')
  }

  if (user.isDeleted) {
    throw new AppError(401, 'This user is already deleted!')
  }
}
//statics methods for user password matched.
UserSchema.statics.isPasswordMached = async function (
  plainTextPassword: string,
  hashedPassword: string
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword)
}

//statics methods for user change password time.
UserSchema.statics.isJWTIssuedAtBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000
  const passwordChangedTimeInt = parseInt(passwordChangedTime.toString())

  const result = passwordChangedTimeInt > jwtIssuedTimestamp
  return result
}

// pre save hook / middleware for password bcrypt.
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    )
  }
  next()
})

//post save hook / middleware for password null.
UserSchema.post('save', function (doc, next) {
  doc.password = ''
  next()
})

//create User Model.
export const User = mongoose.model<TUser, UserModel>('User', UserSchema)
