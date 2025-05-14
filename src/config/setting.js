import dotenv from 'dotenv'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
dotenv.config({ path: envPath })
console.log(`Loading environment variables from: ${envPath}`)

export default {
    port: process.env.PORT,
    baseUrl: process.env.BASE_URL,
    frontEndUrl: process.env.FRONT_END_URL,
    mongoDB: {
        host: process.env.MONGODB_HOST,
        port: process.env.MONGODB_PORT,
        dbName: process.env.MONGODB_DB_NAME,
        user: process.env.MONGODB_USER,
        password: process.env.MONGODB_PASSWORD,
    },
    secrets: {
        jwtSecretKey: process.env.JWT_SECRET,
        jwtTokenExp: process.env.JWT_TOKEN_EXPIRE,
        jwtRefreshExp: process.env.JWT_REFRESH_EXPIRE,
        jwtForgotExp: process.env.JWT_FORGOT_EXPIRE,
    },
    saltWorkFactor: 10,
    awsRegion: process.env.AWS_REGION,
    awsParameterStorePath: process.env.AWS_PARAMETER_STORE_PATH,
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    sendGridApiKey: process.env.SENDGRID_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    emailHost: process.env.EMAIL_HOST,
    emailPort: process.env.EMAIL_PORT,
    emailSecure: process.env.EMAIL_SECURE === 'true',
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASSWORD,
    email: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        address: process.env.EMAIL_ADDRESS,
        password: process.env.EMAIL_PASSWORD,
    },
    sms: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
    },
}
