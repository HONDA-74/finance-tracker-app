import * as paymentService from "../services/payment.service.js";
import { createError } from "../utils/error.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * POST /api/v1/payment/create-payment-intent
 * Protected route — req.user populated by your auth middleware
 */
export const createPaymentIntent = async (req, res, next) => {
  try {
    const userId = req.user.id; // from your existing JWT middleware
    const { clientSecret } = await paymentService.createPaymentIntent(userId);
    res.status(200).json({ success: true, clientSecret });
  } catch (error) {
    next(createError(400, error.message));
  }
};

/**
 * POST /api/v1/payment/webhook
 * PUBLIC route — called by Stripe, NOT by your users
 * MUST use express.raw() — JSON parsing breaks the signature
 */
export const stripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    // This throws if the signature is invalid — preventing spoofed events
    event = stripe.webhooks.constructEvent(
      req.body,              // raw Buffer — do NOT use express.json() on this route
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await paymentService.handleWebhookEvent(event);
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    next(createError(500, "Webhook processing failed"));
  }
};