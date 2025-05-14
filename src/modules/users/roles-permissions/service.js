import RoleModel from "./model.js";


export const getRolesByConditions = async (condition, removeFields = '') => {
    return await RoleModel.findOne({ ...condition }).select(removeFields);
}


export const updateRolesByconditions = async (condition, data) => {
    return await RoleModel.findOneAndUpdate({ ...condition }, { ...data })
}

export const getAllRoles = async (removeFields = '') => {
    return await RoleModel.find().select(removeFields)
}
