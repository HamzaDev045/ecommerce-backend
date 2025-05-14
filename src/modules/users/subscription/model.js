import mongoose from 'mongoose';

const { Schema } = mongoose;

const SubscriptionItemsSchema = new Schema({
    itemId: String,
    lastReportedDate: Date,
    priceId: String,
    usage: {
        phone_calls: { type: Number, default: 0 },
        phone_rental: { type: Number, default: 0 }
    },
    usageType: String
});

const SubscriptionSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, required: true },
    planId: String,
    status: {
        type: Boolean,
        default: false
    },
    billingCycleStartDate: Date,
    billingCycleEndDate: Date,
    items: [SubscriptionItemsSchema],
    stripeSubscriptionId: String
}, { timestamps: true });

export const SubscriptionModel = mongoose.model('Subscriptions', SubscriptionSchema);

export default SubscriptionModel;
