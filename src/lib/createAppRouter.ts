import Router from "@koa/router";
import { createReadStream } from "fs";
import { join, posix } from "path";
import { PassThrough } from "stream";

import { HTTP_CODES } from "../middleware/respond";
import { AuthRouter } from "../routes/auth";
import { GlacierRouter } from "../routes/glacier";
import { ServicesRouter } from "../routes/services";
import { ApiContext, ApiRouter, ApiState } from "../typings/App";
import { logger } from "./logger";

export const BASE_PATH = "/v2";

interface IPromisedEndpoints {
  [index: string]: () => Promise<Router>;
}

interface IEndpoints {
  [index: string]: Router;
}

const ENDPOINTS: IPromisedEndpoints = {
  auth: AuthRouter,
  services: ServicesRouter,
  glacier: GlacierRouter
};

// Initialize each endpoint (concurrently)
export async function createAppRouter(): Promise<ApiRouter> {
  logger.info({ msg: `[INIT] Preparing ${Object.keys(ENDPOINTS).length} endpoints...` });

  const router = new Router<ApiState, ApiContext>();

  attachMainRoutes(router);
  await attachEndpoints(router);

  return router;
}

function attachMainRoutes(router: ApiRouter) {
  router
    .get("/", async ctx => {
      ctx.redirect(BASE_PATH);
    })
    .get(BASE_PATH, async ctx => {
      ctx.body = {
        message: "MasterMovies API",
        status: "active"
      };
    })
    .get(BASE_PATH + "/openapi.json", async ctx => {
      // TODO seperate into different file
      ctx.cache = 3600;
      ctx.body = createReadStream(join(__dirname, "../../assets/openapi.json")).pipe(new PassThrough());
    });
}

async function attachEndpoints(router: Router) {
  const resolvedEndpoints: IEndpoints = {};
  const termination = [];

  const nEndpoints = Object.keys(ENDPOINTS).length;
  let activeEndpoints = 0;

  for (const [path, endpoint] of Object.entries(ENDPOINTS)) {
    termination.push(
      new Promise(async resolve => {
        try {
          const resolvedEndpoint = await endpoint();
          if (resolvedEndpoint === null) throw new Error("Null router returned");
          resolvedEndpoints[path] = resolvedEndpoint;
          logger.info({ msg: `[INIT] Endpoint '${path}' ready` });
          activeEndpoints++;
        } catch (err) {
          resolvedEndpoints[path] = createServiceUnavailable();
          logger.error({ msg: `[INIT] Endpoint '${path}' failed to start`, err });
        }
        resolve();
      })
    );
  }

  await Promise.all(termination);

  // Attach each endpoint to the main router
  for (const [path, endpoint] of Object.entries(resolvedEndpoints)) {
    const attachPath = posix.join(BASE_PATH, ensurePrecedingSlash(path));
    const routes = endpoint.routes();
    router.use(attachPath, routes);
  }

  if (activeEndpoints === nEndpoints) {
    logger.info(`[INIT] ${activeEndpoints}/${nEndpoints} endpoints started`);
  } else {
    logger.warn(`[INIT] ${activeEndpoints}/${nEndpoints} endpoints started`);
  }
}

/** Ensure that a string contains a preceding slash */
function ensurePrecedingSlash(path: string): string {
  if (path[0] !== "/") return "/" + path;
  return path;
}

function createServiceUnavailable() {
  return new Router<ApiState, ApiContext>().all("*", async ctx => {
    ctx.standard(HTTP_CODES.SERVICE_UNAVAILABLE);
  });
}
