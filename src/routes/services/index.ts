import Router from "@koa/router";

import { ApiContext, ApiState } from "../../typings/App";
import { checkRequirements } from "./requirements";
import { attachServicesRoutes } from "./routes";

/** Generate the Glacier endpoint router */
export async function ServicesRouter(): Promise<Router | null> {
  const router = new Router<ApiState, ApiContext>();

  // Verify endpoint requirements
  if (!(await checkRequirements())) return null;

  // Generate all Glacier routes
  attachServicesRoutes(router);

  return router;
}
