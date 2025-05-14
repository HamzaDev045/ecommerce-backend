import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const paymentSchema = new Schema({

    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    }
}, { timestamps: true });

const companySchema = new Schema({
    name: {
        type: String,
        default: null
    },
    size: {
        type: Number,
        default: null
    },
    status: {
        type: Boolean,
        default: false
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    address: {
        address_1: {
            type: String,
            default: null
        },
        address_2: {
            type: String,
            default: null
        },
        city: {
            type: String,
            default: null
        },
        postalCode: {
            type: String,
            default: null
        },
        state: {
            type: String,
            default: null
        },
        country: {
            type: String,
            default: null
        }
    }

}, { timestamps: true });

export const Company = mongoose.model('Company', companySchema);
