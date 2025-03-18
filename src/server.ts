import { Server } from 'http'
import app from './app'
import mongoose from 'mongoose'
import config from './config'

let server: Server

// Main function to initialize the app and connect to the database
async function main() {
  try {
    // connceting to the database / mongodb
    await mongoose.connect(config.mongo_database_url as string)
    // starting the server.
    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`)
    })
  } catch (err) {
    console.error('error from server', err)
  }
}

main()

// Handling unhandled promise rejections
process.on('unhandledRejection', () => {
  console.log('😡 Unhandle Rejection is Detected. Shutting Down....')

  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

// Handling uncaught exceptions
process.on('uncaughtException', () => {
  console.log('😡 Uncaught Exception is Detected. Shutting Down....')
  process.exit(1)
})
