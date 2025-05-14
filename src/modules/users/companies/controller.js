
// import { UserModel } from './model.js'
// import {
//     validateSignUpInput,
//     validateSignInInput,
// } from './validation.js'

// import {
//     getUserByUsername,
//     createUser,
//     updateUserById,
// } from './services.js'

import { apiError, generateToken } from '../../../utils/index.js'
import { MESSEGES } from '../../../constants/index.js'
import { config } from '../../../config/index.js'

export const createCompany = async (
    req,
    res,
    next,
) => {
    try {
        let { fullName, password, username } = req.body
        const validationResult = validateSignUpInput(req.body)

        // if (validationResult.error) {
        //     return next(apiError.badRequest(validationResult?.msg, 'signup'))
        // }

        // const existingUser = await getUserByUsername(username)
        // if (existingUser) {
        //     return next(
        //         apiError.badRequest(MESSEGES.USER_ALREADY_EXIST_MESSAGE, 'signup'),
        //     )
        // }

        // const user = await createUser(
        //     { fullName, password, username, phone: username },
        //     next,
        // )

        const [userData] = await UserModel.aggregate([
            { $match: { _id: user._id } },
            {
                $project: {
                    username: 1,
                    phone: 1,
                    _id: 0,
                },
            },
        ])

        return res
            .status(201)
            .send({ message: MESSEGES.OTP_SUCCESFULLY_SENT, data: { ...userData } })
    } catch (error) {
        // logger.error(error)
        return next(apiError.internal(error, 'signup'))
    }
}

export default {
    createCompany,
}
