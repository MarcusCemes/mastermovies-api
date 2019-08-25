import { constants, promises } from "fs";
import { join, relative } from "path";
import send from "send";

import { GlacierConfig } from "../../../config/glacier";
import { logger } from "../../../lib/logger";
import { HTTP_CODES } from "../../../middleware/respond";
import { Export } from "../../../models/export";
import { ApiContext } from "../../../typings/App";

export async function stream(ctx: ApiContext, download: boolean) {
  // Validate parameters
  if (isNaN(ctx.params.id)) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, "export id must be a number");
    return;
  }

  const session = await ctx.getSession();
  const exportId = ctx.params.id;

  // Check if any authorisations are present
  if (typeof session.glacier !== "object" || typeof session.glacier.authorisations !== "object") {
    ctx.standard(HTTP_CODES.UNAUTHORIZED);
    return;
  }

  // Get the associated film and check for valid authorisation
  const exp = ((await Export.query()
    .findById(exportId)
    .select("filename", "mime", "film.id as filmId")
    .joinRelation("film")
    .first()) as unknown) as { filename: string; mime: string; filmId: number };

  if (!exp) {
    ctx.standard(HTTP_CODES.NOT_FOUND);
    return;
  }

  const expiry = session.glacier.authorisations[exp.filmId];
  if (typeof expiry !== "number" || expiry < Math.floor(Date.now() / 1000)) {
    ctx.standard(HTTP_CODES.UNAUTHORIZED);
    return;
  }

  // Build file path
  const root = GlacierConfig.get("contentPath");
  const dl = join(root, "films", exp.filmId.toString(), "exports", exportId.toString());

  // Check it's located within the root directory
  if (relative(root, dl).substr(0, 1) === ".") {
    logger.error({
      message: "[GLACIER] Glacier content path was not considered safe!",
      rootDir: root,
      contentPath: dl
    });
    throw new Error("Unsafe glacier content path");
  }

  // Check if the file exists
  try {
    await promises.access(dl, constants.F_OK);
  } catch (err) {
    logger.error({ msg: "[GLACIER] Could not access file", contentPath: dl, filmId: exp.filmId, exportId, err });
    throw new Error("Could not locate glacier content");
  }

  ctx.set("Content-Type", exp.mime);
  if (download) {
    ctx.set("Content-Disposition", ` attachment; filename=${exp.filename}`);
  }

  ctx.body = send(ctx.req, dl, {
    acceptRanges: true,
    cacheControl: false,
    index: false,
    dotfiles: "deny",
    lastModified: false
  });
}
