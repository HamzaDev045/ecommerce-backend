import { config } from '../config/index.js';

import stripePackage from 'stripe';

const stripe = stripePackage(config.stripeSecretKey);

export const createStripeCustomer = async (name, email) => {
    const customer = await stripe.customers.create({
        name,
        email,
    });
    return customer
}

export const updateStripeCustomer = async (stripeCustomerKey, metadata) => {
    const customer = await stripe.customers.update(
        stripeCustomerKey,
        {
            metadata: {
                order_id: '6735',
            },
        }
    );
    return customer
}

export const checkoutSession = async (lookupKey, { customer }) => {

    const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
        expand: ['data.product'],
    });

    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        customer,
        line_items: [
            {
                price: prices.data[0].id,
                // For metered billing, do not pass quantity
                // quantity: 1,
            },
        ],
        mode: 'subscription',
        // success_url: `${config.frontEndUrl}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        // cancel_url: `${config.frontEndUrl}?canceled=true`,

        // below are development
        success_url: `${config.frontEndUrl}/portal/profile-settings/billing/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.frontEndUrl}/portal/profile-settings/billing/?canceled=true`,

    });
    return session.url
}

export const portalSession = async (customer) => {
    // const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer,
        return_url: config.frontEndUrl,
    });

    return portalSession?.url
}


export const getStripeOrderDetails = async (sessionId) => {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const subscription = await stripe.subscriptions.retrieve(checkoutSession?.subscription)
    return subscription
}

export const stirpeCustomerUpdate = async (customerId, { city, country, line1, line2, state, postal_code }) => {


    const customer = await stripe.customers.update(
        customerId,
        {
            address: {
                city,
                country,
                line1,
                line2,
                state,
                postal_code
            },
        }
    );


    return customer
}