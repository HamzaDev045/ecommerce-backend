import { SubscriptionModel } from './model.js'

export const getSubscriptionByConditions = async (condition, removeFields = '') => {
    return await SubscriptionModel.findOne({ ...condition }).select(removeFields);
}

export const createSubscription = async (
    data,
) => {
    return await SubscriptionModel.create(data)
}