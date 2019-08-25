import convict, { Config, Schema } from "convict";

import { logger } from "../lib/logger";

/** Generates and validates a new Convict config */
export function createConfig<T extends object>(name: string, config: Schema<T>): Config<T> {
  try {
    const convictConfig = convict(config);
    convictConfig.validate({ allowed: "strict" });
    return convictConfig;
  } catch (err) {
    logger.error({ msg: "[CONFIG] Validation failed for " + name, err });
    throw new Error("Bad config");
  }
}
