import Router from "@koa/router";

import { IApiContext, IApiState } from "../../types/App";
import { checkRequirements } from "./requirements";
import { attachServicesRoutes } from "./routes";

/** Generate the Glacier endpoint router */
export async function ServicesRouter(): Promise<Router | null> {
  const router = new Router<IApiState, IApiContext>();

  // Verify endpoint requirements
  if (!(await checkRequirements())) return null;

  // Generate all Glacier routes
  attachServicesRoutes(router);

  return router;
}
