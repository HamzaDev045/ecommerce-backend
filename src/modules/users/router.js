import { Router } from 'express'
import controller from './controller.js'
import { isAuthorized } from '../../middleware/index.js'


const router = Router()

router
.post('/signup', controller.signUp)

.post('/forgot-password', controller.forgotPassword)
.post('/verify-otp', controller.verifyOTP)
.post('/resend-email', controller.emailResend)
.post('/signin', controller.signIn)
.post('/refresh-token', controller.verifyRefreshToken)



.post('/reset-password/:token', controller.resetPassword)
.post('/change-password', isAuthorized, controller.changePassword)
export default router
