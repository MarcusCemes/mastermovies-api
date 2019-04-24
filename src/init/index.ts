import { Application } from "express";

import { error, noStatus, ok, wait } from "../common/logger";
import csrf from "./csrf";
import database from "./database";
import errorHandlers from "./errorHandlers";
import helmet from "./helmet";
import hpp from "./hpp";
import ratelimit from "./ratelimit";
import routes from "./routes";

// Order is important
const ENABLED_MODULES: Array<[ (app: Application) => void, string ]> = [
  [ database, "Postgres Database" ],
  [ ratelimit, "Rate Limiting" ],
  [ hpp, "HTTP Parameter Pollution" ],
  [ csrf, "Cross Site Request Forgery" ],
  [ helmet, "Secure HTTP Response Headers" ],
  [ routes, "Endpoints Routing" ],
  [ errorHandlers, "Error Handling" ]
]

export default async function initialize(app: Application): Promise<void> {

  noStatus("Injecting modules...")

  // Connect to the database
  /*
  wait("Postgres Database...");
  try {
    app.db = await database();
  } catch (err) {
    error("Postgres Database");
    error(err.message);
    process.exit(1);
  }
  ok(`[0/${ENABLED_MODULES.length}] Postgres Database`);*/

  // Attach each module to the app
  for (let i=0; i<ENABLED_MODULES.length; i++) {
    const moduleMessage = `[${i+1}/${ENABLED_MODULES.length}] ${ENABLED_MODULES[i][1]}`;
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

  return;

}
