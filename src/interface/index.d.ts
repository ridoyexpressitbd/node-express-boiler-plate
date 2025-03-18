import { JwtPayload } from 'jsonwebtoken'
// Extending Express Request: Adds a 'user' property to the Request object, typed as JwtPayload

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload
    }
  }
}
