import * as paymentService from "../services/payment.service.js";
import { createError } from "../utils/error.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


export const createPaymentIntent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { clientSecret } = await paymentService.createPaymentIntent(userId);
    res.status(200).json({ success: true, clientSecret });
  } catch (error) {
    console.log(error);
    next(createError(400, error.message));
  }
};


export const stripeWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,             
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await paymentService.handleWebhookEvent(event);
    console.log("here");
    
    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err.message);
    next(createError(500, "Webhook processing failed"));
  }
};