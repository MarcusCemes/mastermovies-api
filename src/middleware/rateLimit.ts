import { RateLimiterMemory } from "rate-limiter-flexible";

import { Config } from "../config";
import { IApiContext } from "../types/App";
import { HTTP_CODES } from "./respond";

/** Handles low-overhead rate-limiting against DOS attacks */
export function rateLimitMiddleware() {
  const { points, duration } = Config.get("rateLimit");
  const RateLimiter = new RateLimiterMemory({
    duration,
    points,
  });

  return async (ctx: IApiContext, next: () => Promise<void>) => {
    try {
      const result = await RateLimiter.consume(ctx.ip);

      ctx.set({
        "X-RateLimit-Limit": "300",
        "X-RateLimit-Remaining": result.remainingPoints.toString(),
        "X-RateLimit-Reset": Math.round((Date.now() + result.msBeforeNext) / 1000).toString(),
      });
    } catch (err) {
      ctx.standard(HTTP_CODES.TOO_MANY_REQUESTS, "You have exceeded your API quota!");
      if (typeof err === "object" && typeof err.remainingPoints === "number" && typeof err.msBeforeNext === "number") {
        ctx.set({
          "X-RateLimit-Limit": "300",
          "X-RateLimit-Remaining": err.remainingPoints.toString(),
          "X-RateLimit-Reset": Math.round((Date.now() + err.msBeforeNext) / 1000).toString(),
        });
      }
      return;
    }

    await next();
  };
}
