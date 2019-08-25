import exitHook from "async-exit-hook";
import { StoppableServer } from "stoppable";

import { createApp } from "./app";
import { ServerConfig } from "./config/server";
import { getDatabase } from "./database";
import { startServer } from "./lib/createServer";
import { logger } from "./lib/logger";

/** Run the initial start-up process, or fail fast */
export async function createServer() {
  logger.info("MasterMovies API v2");

  warnEnvironment(ServerConfig.get("env"));

  const port = ServerConfig.get("port");
  const ip = ServerConfig.get("ip");

  const app = await createApp();
  const server = await startServer(app, ip, port);
  logger.info(`[SERVER] Listening on http://${ip}:${port}`);

  registerShutdownHook(server);
}

function warnEnvironment(env: string) {
  if (env === "production") {
    logger.info("Server running in PRODUCTION mode");
  } else {
    logger.warn(`⚠ Enviroment is set to ${env.toUpperCase()} ⚠`);
    logger.warn("API may be insecure. Connected to development database.");
  }
}

/** Handle graceful shutdown */
function registerShutdownHook(server: StoppableServer) {
  exitHook(async resolve => {
    logger.info("[SHUTDOWN] Waiting for server to close");
    await server.stop();
    logger.info("[SHUTDOWN] Waiting for database to close");
    await getDatabase().destroy();
    logger.info("[SHUTDOWN] All done!");
    resolve();
  });
}
