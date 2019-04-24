import { Request, Response } from "express";
import { RateLimiterAbstract, RateLimiterRes } from "rate-limiter-flexible";

import { statusResponse } from "../routes/common/standardResponses";

/**
 * Middleware: hit the rate-limiter, setting correct headers, returning boolean of a successful hit
 */
export function rateLimiter(limiter: RateLimiterAbstract) {
  return async (req: Request, res: Response, next: () => void): Promise<void> => {
    try {
      const result = await limiter.consume(req.ip);
      setRateHeaders(res, result);
      next();
    } catch (err) {
      setRateHeaders(res, err);
      statusResponse(res, 429);
    }
  };
}

function setRateHeaders(res: Response, result: RateLimiterRes): void {
  res.set({
    "Retry-After": result.msBeforeNext / 1000,
    "X-RateLimit-Limit": result.consumedPoints + result.remainingPoints,
    "X-RateLimit-Remaining": result.remainingPoints,
    "X-RateLimit-Reset": Math.round((Date.now() + result.msBeforeNext)/1000)
  });
}