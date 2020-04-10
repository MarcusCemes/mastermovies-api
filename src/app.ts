import Koa from "koa";

import { Config } from "./config";
import { createAppRouter } from "./lib/createAppRouter";
import { logger } from "./lib/logger";
import { registerMiddleware } from "./middleware";
import { IApiContext, IApiState, TApiApp } from "./types/App";

export async function createApp(): Promise<TApiApp> {
  const app = new Koa<IApiState, IApiContext>();
  app.proxy = Config.get("server").proxy; // Should be behind reverse proxy

  if (app.proxy) {
    logger.warn("⚠ Trusting connections as PROXY");
  } else {
    logger.warn("⚠ NOT trusting connections as PROXY");
  }

  // Add low-level middleware
  registerMiddleware(app);

  // Add routing
  const appRouter = await createAppRouter();
  app.use(appRouter.routes());
  app.use(
    appRouter.allowedMethods({
      throw: true, // caught by the error handler
    }),
  );

  return app;
}
