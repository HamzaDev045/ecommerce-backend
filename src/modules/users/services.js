import { UserModel } from './model.js'
import { apiError, generateToken } from '../../utils/index.js'
import { MESSEGES } from '../../constants/index.js'
import { config } from '../../config/index.js'



export const getUserByConditions = async (condition, removeFields = '') => {
  return await UserModel.findOne({ ...condition }).select(removeFields); // .populate(populateBy)
}
export const updateUserByCondition = async (condition, data) => {
  return await UserModel.findOneAndUpdate({ ...condition }, data, { new: true })
}


export const getUserByCompanyDetail = async (condition, removeFields = '', isPopulate = false) => {

  if (isPopulate) {
    return await UserModel.findOne({ ...condition }).select(removeFields).populate(({
      path: "companyId",
    })).populate({
      path: "roleId",
      select: 'name permissions'
    });
  } else {
    return await UserModel.findOne({ ...condition }).select(removeFields).populate(({
      path: "companyId",
    }))
  }
}

export const createUser = async (
  data,
  next
) => {
  const existingUser = await getUserByConditions({ email: data.email })

  if (existingUser) {
    throw next(apiError.badRequest(MESSEGES.USER_ALREADY_EXIST_MESSAGE, 'signup'))
  }
  return await UserModel.create(data)
}


export const updateUser = async (
  data,
  next
) => {
  return await UserModel.findOneAndUpdate({ _id: data.userId }, data)
}

export const updateUserById = async (userId, data, next) => {
  const user = await getUserById(userId)
  if (!user) {
    next(apiError.badRequest(MESSEGES.USERNAME_NOT_FOUND, 'updateUser'))
  }

  const mongooseUserId = new Types.ObjectId(userId)

  return await UserModel.findOneAndUpdate({ _id: mongooseUserId }, data)
}

export const deleteUserById = async (data) => {

  return await UserModel.findOneAndDelete({ _id: data.userId })

}

export const getAllUsersByConditionsByRole = async (condition, skip, limit, removeFields = '') => {
  return await UserModel.find(condition)
    .skip(skip)
    .limit(limit)
    .populate('roleId', 'name');
}

export const countUsersByCondition = async (condition) => {
  return await UserModel.countDocuments(condition);
}
