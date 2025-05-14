import { apiError, } from '../../../utils/index.js'
import { MESSEGES } from '../../../constants/index.js'
import { config } from '../../../config/index.js'
import { getAllRoles } from './service.js'

export const getRoles = async (
    req,
    res,
    next,
) => {
    try {
        const roles = await getAllRoles('name ')

        const transformedRoles = roles.map(role => ({
            label: role.name,
            value: role._id
        }));

        return res
            .status(201)
            .send({ isSuccess: true, message: MESSEGES.ROLES_GET_SUCCESS, roles: transformedRoles })

    } catch (error) {
        console.log(error)
        return next(apiError.internal(error, 'signup'))
    }
}


export default {
    getRoles
}
