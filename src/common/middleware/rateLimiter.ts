import { Request, Response } from "express";
import { RateLimiterAbstract, RateLimiterRes } from "rate-limiter-flexible";

import { statusResponse } from "../../routes/common/statusResponse";

/**
 * Middleware: hit the rate-limiter, setting correct headers, returning boolean of a successful hit
 */
export function limit(limiter: RateLimiterAbstract) {
  return async (
    req: Request,
    res: Response,
    next: () => void
  ): Promise<void> => {
    if (await hit(limiter, req.ip, res)) {
      next();
    };
  };
}

/**
 * Attempts to hit the rate-limiter.
 * On success, returns a function that can be used to reverse
 * the hit. It also returns whether the reversal was successful.
 * On failure, returns false (IP exhausted the limit)
 */
export async function hit(limiter: RateLimiterAbstract, ip: string, res: Response): Promise<(() => Promise<boolean>) | false> {
  if (ip) {
    try {
      const result = await limiter.consume(ip);
      setRateHeaders(res, result);
      return async () => {
        try {
          await limiter.reward(ip);
          return true;
        } catch {
          return false;
        }
      };
    } catch (err) {
      setRateHeaders(res, err);
      statusResponse(res, 429, "You have reached your API quota!");
    }
  } else {
    statusResponse(res, 500, "Rejected due to lack of client IP");
  }
  return false;
}



function setRateHeaders(res: Response, result: RateLimiterRes): void {
  res.set({
    "X-RateLimit-Limit": result.consumedPoints + result.remainingPoints,
    "X-RateLimit-Remaining": result.remainingPoints,
    "X-RateLimit-Reset": Math.round((Date.now() + result.msBeforeNext) / 1000)
  });
  res.set("Access-Control-Expose-Headers", "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset");
}
