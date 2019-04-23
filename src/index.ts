// Entry point, spin up the ExpressJS server
import express, { Request, Response } from "express";
import { promisify } from "util";

import { createPool } from "./common/database";
import { error, info, success, warning } from "./common/logger";
import config from "./config/app.config.js";
import { createRoutes } from "./routes";
import { statusResponse } from "./routes/common/standardResponses";

process.stdout.write("MasterMovies API\nAuthor: Marcus Cemes\nTimes are in UTC\n\n");

if (process.env.NODE_ENV === "production") {
  success("Running in production mode");
} else {
  warning("Warning in development mode, unsuitable for production!");
}

(async () => {
  try {
    // Create the database pool
    const pool = await createPool();
    success("Database connection pool ready");

    // Create the express application
    const app = express();
    const PORT = process.env.PORT || config.port;

    // Create the express application routes
    const routes = createRoutes(pool);
    app.use(routes);
    success("Endpoint routers ready");

    // Register 404 handler
    app.use((_req: Request, res: Response, _next: () => void) => {
      statusResponse(res, 404);
    });

    // Register an error handler
    app.use((err: Error, req: Request, res: Response, _next: () => void) => {
      warning("Uncaught error in route '" + req.originalUrl + "'");
      warning("Message: " + err.message);
      if (process.env.NODE_ENV === "production") {
        err.stack.split("\n")
          .filter(v => v.indexOf("mastermovies") !== -1 && v.indexOf("node_modules") === -1)
          .forEach(v => warning(v));
      } else {
        warning(err.stack);
      }
      statusResponse(res, 500);
    });

    // Listen for connections
    app.set("trust proxy", true);
    app.set("json spaces", 2);
    const server = app.listen(PORT, () => {
      success(`Listening on http://127.0.0.1:${PORT}`);
    });

    // Attempt a graceful shutdown
    let shutdown: () => void;
    shutdown = async () => {
      shutdown = () => {/* */};
      info("Graceful shutdown initiated")

      info("Waiting for all connections to close");
      await promisify(server.close);

      info("Draining database connection pool");
      await pool.end();

      success("Server stopped successfully", () => process.exit(0));
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (err) {
    error("An error occurred during startup:");
    error(err.message || err);
    process.exit(1);
  }
})();
