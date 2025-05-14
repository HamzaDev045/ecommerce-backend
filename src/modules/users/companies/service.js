import { Company } from "./model.js"
import { apiError } from '../../../utils/index.js'

export const getCompanyByConditions = async (condition) => {
    return await Company.findOne({ ...condition }).select('-password -__v')
}


export const createCompany = async (
    data,
    next
) => {
    return await Company.create(data)
}

export const updateCompany = async (
    companyId, data
) => {
    return await Company.findOneAndUpdate({ _id: companyId }, data)
}

// const existingCompany = await getCompanyByConditions({ name: data.name })

// if (existingCompany) {
//     throw next(apiError.badRequest('Company already exists', 'company'))
// }
