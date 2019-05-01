import { warn } from "../common/logger";

export function verifyConfig<T extends object, K extends keyof T>(
  config: T,
  required?: K[]
): T {
  let failed = false;
  if (required) {
    for (const requiredKey of required) {
      if (config[requiredKey] === undefined) {
        warn("Missing key '" + requiredKey + "' in config");
        failed = true;
      }
    }
  }
  if (failed) return null;
  return Object.freeze(config);
}
