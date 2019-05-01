import { Application } from "express";

import { error, noStatus, ok, wait } from "../common/logger";
import bodyParser from "./bodyParser";
import cookies from "./cookies";
import csrf from "./csrf";
import database from "./database";
import errorHandlers from "./errorHandlers";
import helmet from "./helmet";
import hpp from "./hpp";
import jwt from "./jwt";
import ratelimit from "./ratelimit";
import routes from "./routes";

// Order is important
const ENABLED_MODULES: Array<[(app: Application) => void, string]> = [
  [database, "Postgres Database"],
  [ratelimit, "Rate Limiting"],
  [bodyParser, "HTTP Body Parser"],
  [hpp, "HTTP Parameter Pollution"],
  [cookies, "Cookie parsing"],
  [csrf, "Cross Site Request Forgery"],
  [helmet, "Secure HTTP Response Headers"],
  [jwt, "JSON Web Token Authentication"],
  [routes, "Endpoints Routing"],
  [errorHandlers, "Error Handling"]
];

export default async function initialize(app: Application): Promise<void> {
  noStatus("Injecting modules...");

  // Attach each module to the app
  for (let i = 0; i < ENABLED_MODULES.length; i++) {
    const moduleMessage = `[${i + 1}/${ENABLED_MODULES.length}] ${
      ENABLED_MODULES[i][1]
    }`;
    wait(moduleMessage + "...");
    try {
      await ENABLED_MODULES[i][0](app);
    } catch (err) {
      error(moduleMessage);
      error(err.message);
      process.exit(1);
    }
    ok(moduleMessage);
  }

  // Trust the NGINX proxy, and make JSON pretty
  app.set("trust proxy", true);
  app.set("json spaces", 2);

  ok("All modules active");

  return;
}
