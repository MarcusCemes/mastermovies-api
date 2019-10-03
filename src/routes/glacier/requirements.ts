import assert, { doesNotReject } from "assert";
import { constants, promises } from "fs";

import { Config } from "../../config";
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
  const contentPath = Config.get("glacier").path;
  await promises.access(contentPath, constants.F_OK);
  assert((await promises.stat(contentPath)).isDirectory(), "Content path is not a directory");
}

async function validDatabase(): Promise<void> {
  logger.debug("[GLACIER] Validating database connection");
  await doesNotReject(testDatabase, null, "Could not connect to database");
}
