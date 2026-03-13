import rateLimit from 'express-rate-limit';

// It allows 100 requests every 15 minutes per IP address.
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP. Please try again in 15 minutes.' },
    standardHeaders: true, // Sends limit information in the `RateLimit-*` headers
    legacyHeaders: false,
});

// Layer 2: Strict Limit (For sensitive or heavy traffic routes)
// Allows only 5 requests per minute per IP address
export const strictLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: 'You have exceeded the security limit for this action. Please try again in 1 minute.' },
    standardHeaders: true,
    legacyHeaders: false,
});