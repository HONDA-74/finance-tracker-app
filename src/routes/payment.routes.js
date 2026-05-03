import express from "express";
import { createPaymentIntent, stripeWebhook } from "../controllers/payment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js"; // your existing middleware

const router = express.Router();

// Webhook MUST be raw — register BEFORE express.json() processes anything
// We handle this in app.js (see note below)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // ← raw body for Stripe signature
  stripeWebhook
);

// Protected: user must be authenticated
router.use(express.json()); // apply JSON parsing for all routes after webhook
router.post("/create-payment-intent", authenticate, createPaymentIntent);

export default router;