import { constants, promises } from "fs";
import { relative, resolve } from "path";
import send from "send";

import { Config } from "../../../config";
import { logger } from "../../../lib/logger";
import { IApiContext } from "../../../types/App";

/** Streams a file from the Glacier content directory */
export async function streamFile(ctx: IApiContext, path: string, mime: string | null, download?: string) {
  // Check whether the path is safe
  const ROOT = Config.get("glacier").path;
  if (relative(ROOT, path).substr(0, 1) === ".") {
    logger.error({
      message: "[GLACIER] Glacier content path was not considered safe!",
      rootDir: ROOT,
      contentPath: path,
    });
    throw new Error("Unsafe glacier content path");
  }

  const safePath = resolve(path);

  // Check if the file exists
  try {
    await promises.access(safePath, constants.F_OK);
  } catch (err) {
    logger.error({ msg: "[GLACIER] Could not access file", contentPath: safePath });
    throw new Error("Could not locate glacier content");
  }

  if (mime) ctx.set("Content-Type", mime);

  if (typeof download === "string") {
    ctx.set("Content-Disposition", ` attachment; filename=${download}`);
  }

  ctx.body = send(ctx.req, safePath, {
    acceptRanges: true,
    cacheControl: false,
    index: false,
    dotfiles: "deny",
    lastModified: false,
  });
}
