import express from 'express'

import { UserRoutes } from '../modules/users/user.route'

const routers = express.Router()

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes
  }
]

moduleRoutes.forEach(route => {
  routers.use(route.path, route.route)
})

export default routers
