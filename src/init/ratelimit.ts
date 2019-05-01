import { Application } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { limit } from "../common/middleware/rateLimiter";

/** Protect against DDOS attacks */
export default function initialize(app: Application): void {
  // Add the rate limiter middleware
  app.use(
    limit(
      new RateLimiterMemory({
        duration: 60,
        points: 60
      })
    )
  );
}
