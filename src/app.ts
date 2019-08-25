import Koa from "koa";

import { createAppRouter } from "./lib/createAppRouter";
import { registerMiddleware } from "./middleware";
import { ApiApp, ApiContext, ApiState } from "./typings/App";

export async function createApp(): Promise<ApiApp> {
  // Create a new Koa app
  const app = new Koa<ApiState, ApiContext>();
  app.proxy = true; // Behind NGINX reverse proxy

  // Add low-level middleware
  await registerMiddleware(app);

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
