import exitHook from "async-exit-hook";
import { StoppableServer } from "stoppable";

import { createApp } from "./app";
import { Config } from "./config";
import { getDatabase } from "./database";
import { startServer } from "./lib/createServer";
import { logger } from "./lib/logger";

/** Run the initial start-up process, or fail fast */
export async function createServer() {
  logger.info("MasterMovies API v2");

  warnEnvironment(Config.get("env"));

  const { host, port } = Config.get("server");

  const app = await createApp();
  const server = await startServer(app, host, port);
  logger.info(`[SERVER] Listening on http://${host}:${port}`);

  registerShutdownHook(server);
}

function warnEnvironment(env: string) {
  if (env === "production") {
    logger.info("⚠ Server running in PRODUCTION mode");
    logger.info("⚠ Secure features are ENABLED, PRODUCTION database connected");
  } else {
    logger.warn(`⚠ Environment is set to ${env.toUpperCase()}`);
    logger.warn("⚠ Secure features are DISABLED, DEVELOPMENT database connected");
  }
}

/** Handle graceful shutdown */
function registerShutdownHook(server: StoppableServer) {
  exitHook(async (resolve: () => {}) => {
    logger.info("[SHUTDOWN] Waiting for server to close");
    await server.stop();
    logger.info("[SHUTDOWN] Waiting for database to close");
    await getDatabase().destroy();
    logger.info("[SHUTDOWN] All done!");
    resolve();
  });
}
