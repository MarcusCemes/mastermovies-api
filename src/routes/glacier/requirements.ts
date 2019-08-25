import assert, { doesNotReject } from "assert";
import { constants, promises } from "fs";

import { GlacierConfig } from "../../config/glacier";
import { testDatabase } from "../../database";
import { logger } from "../../lib/logger";

export async function checkRequirements(): Promise<boolean> {
  try {
    await validPaths();
    await validDatabase();
  } catch (err) {
    logger.error({ msg: "[GLACIER] Start requirements failed", err });
    return false;
  }
  return true;
}

async function validPaths(): Promise<void> {
  logger.debug("[GLACIER] Validating glacier content path");
  await promises.access(GlacierConfig.get("contentPath"), constants.F_OK);
  assert((await promises.stat(GlacierConfig.get("contentPath"))).isDirectory(), "Content path is not a directory");
}

async function validDatabase(): Promise<void> {
  logger.debug("[GLACIER] Validating database connection");
  await doesNotReject(testDatabase, null, "Could not connect to database");
}
