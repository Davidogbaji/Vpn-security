import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

// Standard rate limiter for single IP lookups and tool computations
export const standardRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. You have exceeded the rate limit. Please try again after 15 minutes.',
  },
});

// Stricter rate limiter for bulk analysis to prevent denial of service and API quota exhaustion
export const bulkRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 batch submissions per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Bulk analysis rate limit reached. Free tier allows up to 10 batch requests per 15 minutes.',
  },
});
