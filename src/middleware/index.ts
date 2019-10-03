import bodyParser from "koa-bodyparser";
import koaHelmet from "koa-helmet";

import { logger } from "../lib/logger";
import { TApiApp } from "../types/App";
import { cacheMiddleware } from "./cache";
import { corsMiddleware } from "./cors";
import { csrfMiddleware } from "./csrf";
import { databaseMiddleware } from "./database";
import { errorHandler } from "./errorHandler";
import { notFoundHandler } from "./notFoundHandler";
import { rateLimitMiddleware } from "./rateLimit";
import { respondMiddleware } from "./respond";
import { sessionMiddleware } from "./session";

const MIDDLEWARE = [
  corsMiddleware,
  respondMiddleware, // add ctx methods
  errorHandler,
  () => koaHelmet({ hsts: false }),
  rateLimitMiddleware,
  notFoundHandler,
  cacheMiddleware,
  bodyParser,
  csrfMiddleware,
  sessionMiddleware,
  databaseMiddleware
];

export function registerMiddleware(app: TApiApp) {
  logger.debug(`[INIT] Preparing to register ${MIDDLEWARE.length} middleware`);
  for (const middleware of MIDDLEWARE) {
    app.use(middleware());
  }
  logger.info(`[INIT] Registered ${MIDDLEWARE.length}/${MIDDLEWARE.length} middleware`);
}
