import rateLimit from 'express-rate-limit';

// General API rate limiter: max 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Combine IP + User-Agent to prevent IP-spoofing bypasses
    return `${req.ip}-${req.headers['user-agent'] || ''}`;
  },
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this client. Please try again after 15 minutes.',
    },
  },
});

// Strict rate limiter for Auth endpoints (login/register): max 5 failed attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Strict 5 attempts limit
  skipSuccessfulRequests: true, // Only count FAILED login attempts for account lockout
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit per IP + target email address to block distributed credential stuffing
    const targetEmail = req.body?.email ? String(req.body.email).toLowerCase().trim() : '';
    return `${req.ip}-${targetEmail}`;
  },
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Account locked due to multiple failed login attempts. Please try again after 15 minutes.',
    },
  },
});
