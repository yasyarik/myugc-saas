import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
    // @ts-expect-error - version type mismatch in some environments
    apiVersion: "2024-12-18.ac",
});
