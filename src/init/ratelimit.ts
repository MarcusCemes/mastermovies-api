import { Application } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { rateLimiter } from "../common/rateLimitMiddleware";

/** Protect against HTTP Parameter Pollution */
export default function initialize(app: Application): void {

  // Add the rate limiter middleware
  app.use(
    rateLimiter(
      new RateLimiterMemory({
        duration: 60,
        points: 60
      })
    )
  );
}
