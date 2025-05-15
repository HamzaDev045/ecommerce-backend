import { nanoid } from 'nanoid'
import mongoose from 'mongoose'
import { UserModel } from './model.js'
import {
  validateSignUpInputs,
  validateSignInInputs,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateResetToken,
  validateResendEmailVerify,
  validateEmailResend,
  validateOtpVerification,
} from './validation.js'


import {
  createUser,
  getUserByConditions,
  updateUser,

} from './services.js'

import { apiError, generateToken, generateRefreshToken,  verifyJwtToken } from '../../utils/index.js'
import { MESSEGES } from '../../constants/index.js'

import { createCompany } from './companies/service.js'
import { sendVerificationEmail } from '../../utils/index.js'


export const signUp = async (
  req,
  res,
  next,
) => {
  try {

    const validationResult = validateSignUpInputs(req.body)

    if (validationResult?.error)
      return next(apiError.badRequest(validationResult?.msg, 'signUp'))

    const user = await createUser({ ...req.body}, next)

    if (!user) throw next(apiError.badRequest(MESSEGES.USER_CREATION_FAILED, 'signup'))

    return res
      .status(201)
      .send({ isSuccess: true, message: MESSEGES.USER_REGINSTERED, data: { email: req.body?.email } })

  } catch (error) {
    console.log(error)
    return next(apiError.internal(error, 'signup'))
  }
}



export const signIn = async (
  req,
  res,
  next,
) => {
  try {
    let { password, email } = req.body

    const validationResult = validateSignInInputs(req.body)

    if (validationResult?.error) {
      return next(apiError.badRequest(validationResult?.msg, 'signin'))
    }


    const existingUser = await getUserByConditions({ email })


    if (!existingUser) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, 'signin'),
      )
    }

    // if (!existingUser?.accountVerificationMethods?.isEmailVerified)
    //   return next(
    //     apiError.badRequest(MESSEGES.EMAIL_NOT_VERIFIED, 'signin'),
    //   )

    // if (!existingUser?.isAccountEnable)
    //   return next(
    //     apiError.badRequest(MESSEGES.ACCOUNT_NOT_ACTIVE, 'signin'),
    //   )

    const match = await existingUser?.checkPassword(password)
    if (!match) return next(
      apiError.badRequest(MESSEGES.PASSWORD_INVALID, 'signin'),
    )
    
    const userData = {
      _id: existingUser._id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
      createdAt: existingUser.createdAt,
      updatedAt: existingUser.updatedAt
    };


    const token = await generateToken({ username: existingUser?.username, email: existingUser?.email })
    const refreshToken = await generateRefreshToken({ username: existingUser?.username, email: existingUser?.email })

    delete existingUser.password;

    return res
      .status(201)
      .send({ isSucess: true, message: MESSEGES.SIGNIN_SUCCESSFULL, token, refreshToken, data: userData })
  } catch (error) {
    console.log(error)
    return next(apiError.internal(error, 'signup'))
  }
}



export const forgotPassword = async (req, res, next) => {
  try {
    const validationResult = validateForgotPassword(req.body)
    if (validationResult.error)
      return next(apiError.badRequest(validationResult?.msg, 'forgotPassword'))

    const { email } = req.body
    const user = await getUserByConditions({ email })
    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, 'forgotPassword'),
      )
    }

    const otp = Math.floor(1000 + Math.random() * 9000); 
    const otpExpiry = Date.now() + 5 * 60 * 1000; 
    await updateUser({ userId: user._id, otp, otpExpiry })

    await sendVerificationEmail(user, otp, "accountForgotPassword", next)

    return res
      .status(201)
      .send({ isSuccess: true, message: MESSEGES.EMAIL_SENT, data: { email: req.body?.username } })

  } catch (error) {
    console.log(error)
    return next(apiError.internal(error, 'forgotPassword'))
  }
}

export const verifyOTP = async (req, res, next) => {
  try {
    const validationResult = validateOtpVerification(req.body); 
    if (validationResult?.error) {
      return next(apiError.badRequest(validationResult.msg, 'verifyResetToken'));
    }

    const {  otp } = req.body; 
    const user = await getUserByConditions({otp});
    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.INVALID_OTP, 'verifyResetToken')
      );
    }
    // Check if OTP has expired
    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return next(
        apiError.badRequest(MESSEGES.OTP_EXPIRED, 'verifyResetToken')
      );
    }

    await updateUser({ 
      userId: user._id, 
  
      otp: null, 
      otpExpiry: null 
    });

    return res.status(200).json({ 
      isSuccess: true, 
      message: MESSEGES.OTP_VERIFIED, 
      data: { email: user.email }
    });
    
  } catch (error) {
    console.log('Verify reset token error:', error); // Improved logging
    return next(apiError.internal(error, 'verifyResetToken'));
  }
};


export const resetPassword = async (req, res, next) => {
  try {
    const token = req.params?.token || ""
    const validationResult = validateResetPassword({ ...req.body, token })
    if (validationResult.error)
      return next(apiError.badRequest(validationResult?.msg, 'forgotPassword'))

    const user = await getUserByConditions({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });

    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, 'resetTokenVerify'),
      )
    }

    await updateUser({ userId: user._id, password: req.body.password })

    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.isEmailVerified = true;

    await user.save();

    return res
      .status(201)
      .send({ isSuccess: true, message: MESSEGES.PASSWORD_RESET_SUCCESS })

  } catch (error) {
    console.log(error)
    return next(apiError.internal(error, 'forgotPassword'))
  }
}



export const changePassword = async (req, res, next) => {
  try {
    const validationResult = validateChangePassword(req.body)
    if (validationResult.error)
      return next(apiError.badRequest(validationResult?.msg, 'changePassword'))

    const { newPassword, password } = req.body

    const user = await getUserByConditions({ _id: req.userId });

    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, 'changePassword'),
      )
    }

    const match = await user?.checkPassword(password)

    if (!match) return next(
      apiError.badRequest(MESSEGES.PASSWORD_INVALID, 'signin'),
    )
    await updateUser({ userId: user._id, password: newPassword })

    return res
      .status(201)
      .send({ isSuccess: true, message: MESSEGES.PASSWORD_RESET_SUCCESS })

  } catch (error) {
    console.log(error)
    return next(apiError.internal(error, 'forgotPassword'))
  }
}

export const verifyRefreshToken = async (req, res, next) => {
  try {
    const validationResult = validateResetToken(req.body)
    if (validationResult.error)
      return next(apiError.badRequest(validationResult?.msg, 'changePassword'))

    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(apiError.badRequest(MESSEGES.AUTHORIZATION_TOKEN_NOT_FOUND, 'verifyRefreshToken'))
    }

    const decodeRefreshToken = await verifyJwtToken(refreshToken)

    if (decodeRefreshToken?.exp < Math.floor(Date.now() / 1000)) {
      return next(apiError.badRequest(MESSEGES.REFRESH_TOKEN_EXPIRED, 'verifyRefreshToken'))
    }

    const user = await getUserByConditions({ email: decodeRefreshToken?.email });

    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, 'verifyRefreshToken'),
      )
    }

    const token = await generateToken({ username: user?.username, email: user?.email })

    return res
      .status(201)
      .send({ isSuccess: true, message: MESSEGES.NEW_TOKEN_GENERATE_SUCCESS, token })

  } catch (error) {
    console.log(error.message)
    return next(apiError.badRequest(error?.message === 'jwt expired' ? MESSEGES.REFRESH_TOKEN_EXPIRED : MESSEGES.TOKEN_NOT_VERIFIED, 'verifyRefreshToken'))
  }
}

export const emailResend = async (req, res, next) => {
  try {
    const { email } = req.body;

    const validationResult = validateEmailResend(req.body)
    if (validationResult.error)
      return next(apiError.badRequest(validationResult?.msg, 'emailVerificationResend'))

    const user = await getUserByConditions({email})

    if (!user) {
      return next(
        apiError.badRequest(MESSEGES.USER_DOES_NOT_EXIST, 'emailVerificationResend'),
      )
    }

  
    const otp = Math.floor(1000 + Math.random() * 9000); 
    const otpExpiry = Date.now() + 5 * 60 * 1000; 
    await updateUser({ userId: user._id, otp, otpExpiry })

    await sendVerificationEmail(user, otp, "accountForgotPassword", next)

    user.save()

    return res
      .status(201)
      .send({ isSuccess: true, message: MESSEGES.EMAIL_VERIFICATION_LINK })

  } catch (error) {
    console.log(error.message)
    return next(apiError.internal(error?.message, 'emailVerificationResend'))
  }
}



export default {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyRefreshToken,
  emailResend,
  verifyOTP,
}
