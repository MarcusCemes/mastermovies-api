import { ServerConfig } from "../config/server";

/** Throw an error if running in production mode */
export function ensureNotProduction() {
  if (ServerConfig.get("env") === "production") {
    throw Object.defineProperty(
      new Error("Cannot continue for safety reasons in production mode"),
      "name",
      "ProductionError"
    );
  }
}
