import Router from "@koa/router";

import { IApiContext, IApiState } from "../../types/App";
import { checkRequirements } from "./requirements";
import { attachGlacierRoutes } from "./routes";

/** Generate the Glacier endpoint router */
export async function GlacierRouter(): Promise<Router | null> {
  const router = new Router<IApiState, IApiContext>();

  // Verify endpoint requirements
  if (!(await checkRequirements())) return null;

  // Generate all Glacier routes
  attachGlacierRoutes(router);

  return router;
}
