import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 mins'
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 1000, 
  message: 'Too many API requests from this IP, please try again after an hour'
});
