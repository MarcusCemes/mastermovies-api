import convict, { SchemaObj } from "convict";

import { logger } from "../lib/logger";
import { AuthConfig } from "./auth";
import { DatabaseConfig } from "./database";
import { ConfigFormats } from "./formats";
import { GlacierConfig } from "./glacier";
import { RateLimitConfig } from "./ratelimit";
import { ServerConfig } from "./server";
import { ServicesConfig } from "./services";

const EnvConfig: SchemaObj<"production" | "development"> = {
  doc: "The application environment",
  format: ["production", "development"],
  default: "development",
  env: "NODE_ENV"
};

// Modular application configuration
const config = {
  auth: AuthConfig,
  env: EnvConfig,
  database: DatabaseConfig,
  glacier: GlacierConfig,
  rateLimit: RateLimitConfig,
  server: ServerConfig,
  services: ServicesConfig
};

// Add custom formats
convict.addFormats(ConfigFormats);

// Create and export the config
export const Config = convict(config);

// Verify that the convict is ready for runtime
try {
  Config.validate({ allowed: "strict" });
  logger.info("[CONFIG] Validation successful");
} catch (err) {
  logger.error({ msg: "[CONFIG] Failed to validate config", err });
  throw new Error("Bad config");
}
