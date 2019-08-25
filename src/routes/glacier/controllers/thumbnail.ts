import { constants, promises } from "fs";
import { join, relative } from "path";
import send from "send";

import { GlacierConfig } from "../../../config/glacier";
import { logger } from "../../../lib/logger";
import { HTTP_CODES } from "../../../middleware/respond";
import { Thumbnail } from "../../../models/thumbnail";
import { ApiContext } from "../../../typings/App";

export async function thumbnail(ctx: ApiContext) {
  ctx.cache = "1 year";

  // Validate parameters
  if (isNaN(ctx.params.id)) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, "thumbnail id must be a number");
    return;
  }

  const thumbnailId = ctx.params.id;

  // Get the associated film id
  const thumb = await Thumbnail.query()
    .findById(thumbnailId)
    .eager("film");
  const filmId = thumb.film.id;

  // Build file path
  const root = GlacierConfig.get("contentPath");
  const dl = join(root, "films", filmId.toString(), "thumbs", thumbnailId.toString());

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
    logger.error({ msg: "[GLACIER] Could not access file", contentPath: dl, filmId, thumbnailId, err });
    throw new Error("Could not locate glacier content");
  }

  ctx.set("Content-Type", thumb.mime);

  ctx.body = send(ctx.req, dl, {
    acceptRanges: true,
    cacheControl: false,
    index: false,
    dotfiles: "deny",
    lastModified: false
  });
}
