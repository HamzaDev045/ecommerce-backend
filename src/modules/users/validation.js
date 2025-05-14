import Joi from 'joi'
import { MESSEGES } from '../../constants/index.js'
export const validateSignUpInputs = (data) => {
  const Schema = Joi.object({
    role: Joi.string().valid('admin', 'user').required(),
    username: Joi.string().required().messages({
      'string.empty': MESSEGES.FUll_NAME_INVALID,
    }),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
    confirmPassword: Joi.string().min(8).max(30).required()
      .valid(Joi.ref('password'))
      .messages({ 'any.only': MESSEGES.PASSWORD_MISMATCH })
    ,
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}


export const validateSignInInputs = (data) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
  });


  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }

}

export const validateOtpVerification=(data) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().required(),
  });
  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }}
export const validateForgotPassword = (data) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}


export const validateResetPassword = (data) => {
  const Schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(30).required(),
    confirmPassword: Joi.string().min(8).max(30).required()
      .valid(Joi.ref('password'))
      .messages({ 'any.only': MESSEGES.PASSWORD_MISMATCH })
    ,
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateUpdatePassword = (data) => {
  const Schema = Joi.object({
    newPassword: Joi.string()
      .length(5)
      .pattern(/^[0-9]{5,}$/)
      .required()
      .messages({ 'string.pattern.base': MESSEGES.PASSWORD_INVALID }),

    confirmPassword: Joi.string()
      .length(5)
      .pattern(/^[0-9]{5,}$/)
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({ 'any.only': MESSEGES.PASSWORD_MISMATCH }),
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

const MESSAGES = {
  PASSWORD_MISMATCH: "New password cannot be the same as the old password.",
};

const validatePasswordChange = (value, helpers) => {
  if (value === helpers.state.ancestors[0].password) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const validateChangePassword = (data) => {
  const Schema = Joi.object({
    password: Joi.string().min(8).max(30).required(),
    newPassword: Joi.string().min(8).max(30).required().custom(validatePasswordChange),
    confirmPassword: Joi.string().min(8).max(30).required()
      .valid(Joi.ref('newPassword'))
      .messages({ 'any.only': MESSEGES.PASSWORD_MISMATCH })
    ,
  }).messages({ 'any.invalid': MESSAGES.PASSWORD_MISMATCH });

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}


export const validateResetToken = (data) => {
  const Schema = Joi.object({
    refreshToken: Joi.string().required(),
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}
export const validateCheckoutSession = (data) => {
  const Schema = Joi.object({
    lookupKey: Joi.string().required(),
  })
  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validatePortalSession = (data) => {
  const Schema = Joi.object({
    customerId: Joi.string().required(),
  })
  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateResendEmailVerify = (data) => {
  const Schema = Joi.object({
    customerId: Joi.string().required(),
  })
  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateCreateOrder = (data) => {
  const Schema = Joi.object({
    sessionId: Joi.string().required(),
  })
  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateSubscription = (data) => {
  const Schema = Joi.object({
    billingCycleStartDate: Joi.number().required(),
    billingCycleEndDate: Joi.number().required(),
    stripeSubscriptionId: Joi.string().required(),
    planId: Joi.string().required(),
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateTeamSignUp = (data) => {
  const Schema = Joi.object({
    fullName: Joi.string().optional().messages({
      'string.empty': MESSEGES.FUll_NAME_INVALID,
    }),
    email: Joi.string().email().optional(),
    role: Joi.string().optional()
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateDeleteUserRole = (data) => {
  const Schema = Joi.object({
    role: Joi.string().required()
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}
export const validateCompanyUserStatus = (data) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
    status: Joi.boolean().required(),

  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateUpdateUserRole = (data) => {
  const Schema = Joi.object({
    fullName: Joi.string().optional().messages({
      'string.empty': MESSEGES.FUll_NAME_INVALID,
    }),
    email: Joi.string().email().required(),
    role: Joi.string().optional()
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}
export const validateDeleteCompanyUser = (data) => {
  const Schema = Joi.object({
    userId: Joi.string().required(),
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateEmailVerificationResend = (data) => {
  const Schema = Joi.object({
    email: Joi.string().required(),
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateEmailResend = (data) => {
  const Schema = Joi.object({
    email: Joi.string().required(),
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}

export const validateStripeCustomerUpdate = (data) => {
  const Schema = Joi.object({
    address1: Joi.string().allow('').optional(),
    address2: Joi.string().allow('').optional(),
    city: Joi.string().allow('').optional(),
    postalCode: Joi.string().allow('').optional(),
    country: Joi.string().allow('').optional(),
    state: Joi.string().allow('').optional(),
  })

  const result = Schema.validate(data)
  return {
    error: result?.error,
    msg: result?.error?.details[0]?.message,
  }
}
