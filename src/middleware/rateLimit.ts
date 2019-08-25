import { RateLimiterMemory } from "rate-limiter-flexible";

import { RateLimitConfig } from "../config/ratelimit";
import { ApiContext } from "../typings/App";
import { HTTP_CODES } from "./respond";

/** Handles low-overhead rate-limiting against DOS attacks */
export function rateLimitMiddleware() {
  const RateLimiter = new RateLimiterMemory({
    duration: RateLimitConfig.get("duration"),
    points: RateLimitConfig.get("points")
  });

  return async (ctx: ApiContext, next: () => Promise<void>) => {
    try {
      const result = await RateLimiter.consume(ctx.ip);

      ctx.set({
        "X-RateLimit-Limit": "300",
        "X-RateLimit-Remaining": result.remainingPoints.toString(),
        "X-RateLimit-Reset": Math.round((Date.now() + result.msBeforeNext) / 1000).toString()
      });
    } catch (err) {
      ctx.standard(HTTP_CODES.TOO_MANY_REQUESTS, "You have exceeded your API quota!");
      if (typeof err === "object" && typeof err.remainingPoints === "number" && typeof err.msBeforeNext === "number") {
        ctx.set({
          "X-RateLimit-Limit": "300",
          "X-RateLimit-Remaining": err.remainingPoints.toString(),
          "X-RateLimit-Reset": Math.round((Date.now() + err.msBeforeNext) / 1000).toString()
        });
      }
      return;
    }

    await next();
  };
}
