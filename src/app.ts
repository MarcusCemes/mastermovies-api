import Koa from "koa";

import { ServerConfig } from "./config/server";
import { createAppRouter } from "./lib/createAppRouter";
import { logger } from "./lib/logger";
import { registerMiddleware } from "./middleware";
import { ApiApp, ApiContext, ApiState } from "./typings/App";

export async function createApp(): Promise<ApiApp> {
  // Create a new Koa app
  const app = new Koa<ApiState, ApiContext>();
  app.proxy = ServerConfig.get("proxy"); // Behind NGINX reverse proxy

  if (app.proxy) {
    logger.info("Running in proxy mode");
  } else {
    logger.warn("NOT running in proxy mode! Insecure!");
  }

  // Add low-level middleware
  registerMiddleware(app);

  // Add routing
  const appRouter = await createAppRouter();
  app.use(appRouter.routes());
  app.use(
    appRouter.allowedMethods({
      throw: true // caught by the error handler
    })
  );

  return app;
}
