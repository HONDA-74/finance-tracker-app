import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000, // Limit each IP to 100 requests (per 15 mins)
  message: "Too many requests from this IP, please try again after 15 mins",
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: "Too many API requests from this IP, please try again after an hour",
});
