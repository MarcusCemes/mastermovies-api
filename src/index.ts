// Entry point, spin up the ExpressJS server
import express, { Application } from "express";
import { Server } from "http";

import { done, error, ok, wait, warn } from "./common/logger";
import { AppConfig } from "./config";
import initialize from "./init";

process.stdout.write(
  "MasterMovies API\nAuthor: Marcus Cemes\nTimes are in UTC\n\n"
);

if (process.env.NODE_ENV === "production") {
  ok("Running in production mode\n");
} else {
  warn("In development mode, unsuitable for production!\n");
}

(async () => {
  // Create the express application
  wait("Creating Express.js application...");
  const app = express();
  const PORT = AppConfig.port;

  // Initialize application with middleware
  await initialize(app);

  // Listen for connections
  let server: Server;
  try {
    server = app.listen(PORT, () => {
      done(`Listening on http://127.0.0.1:${PORT}\n`);
    });
  } catch (err) {
    error("An error occurred during startup:");
    error(err.message || err);
    process.exit(1);
  }

  // Add shutdown hooks
  const shutdownHandler = shutdown(server, app);
  process.on("SIGTERM", shutdownHandler);
  process.on("SIGINT", shutdownHandler);
})();

function shutdown(server: Server, app: Application): () => any {
  return async function _shutdown(): Promise<void> {
    process.removeListener("SIGTERM", _shutdown);
    process.removeListener("SIGINT", _shutdown);

    // Just try and close as quickly and gracefully as possible
    server.close();
    app.db.end();
    process.exit(0);
  };
}
