import Stripe from "stripe";
import {User} from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Creates a Stripe PaymentIntent for the premium plan.
 * Amount is always read from ENV — never from the client.
 */
export const createPaymentIntent = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (user.plan === "premium") {
    throw new Error("User already has a premium plan");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(process.env.STRIPE_PREMIUM_PRICE, 10), // e.g. 999 = $9.99
    currency: "usd",
    metadata: {
      userId: userId.toString(), // store userId so webhook can find the user
    },
  });

  return { clientSecret: paymentIntent.client_secret };
};

/**
 * Handles verified Stripe webhook events.
 * Only upgrades the user AFTER Stripe confirms payment server-to-server.
 */
export const handleWebhookEvent = async (event) => {
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata?.userId;

    if (!userId) {
      console.error("Webhook: No userId in metadata");
      return;
    }

    await User.findByIdAndUpdate(userId, { plan: "premium", premiumStartedAt: new Date() });
    console.log(`User ${userId} upgraded to premium`);
  }
};