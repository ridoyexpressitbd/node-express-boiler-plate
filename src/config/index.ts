import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env file
dotenv.config({ path: path.join(process.cwd(), '.env') })

// Export configuration settings from environment variables
export default {
  NODE_ENV: process.env.NODE_ENV || 'production',
  port: process.env.PORT || 5000,
  bcrypt_salt_rounds: process.env.bcrypt,
  mongo_database_url: process.env.MONGO_DATABASE_URL,
  jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET,
  jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
  jwt_access_token_expires_in: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  jwt_refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  email_host_provider_name: process.env.EMAIL_HOST_PROVIDER_NAME,
  email_host_provider_port: process.env.EMAIL_HOST_PROVIDER_PORT,
  email_sender_email: process.env.EMAIL_SENDER_EMAIL,
  email_sender_email_app_pass: process.env.EMAIL_SENDER_EMAIL_APP_PASS,
  social_login_google_client_id: process.env.SOCIAL_LOGIN_GOOGLE_CLIENT_ID,
  social_login_google_client_secret:
    process.env.SOCIAL_LOGIN_GOOGLE_CLIENT_SECRET,
  social_login_google_redirect_url:
    process.env.SOCIAL_LOGIN_GOOGLE_REDIRECT_URL,
  social_login_google_oauth2_url: process.env.SOCIAL_LOGIN_GOOGLE_OAUTH2_URL,
  cloudinary_cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET
}
