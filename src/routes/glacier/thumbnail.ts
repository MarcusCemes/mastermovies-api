import { Request, Response } from "express";
import { access, constants } from "fs";

import { GlacierConfig } from "../../config";
import { getFilmThumbnail } from "../../models/glacier";
import { securePath } from "../common/helpers.js";

export async function downloadThumbnail(req: Request, res: Response, next: (err?: Error) => void): Promise<void> {
  try {
    if (!req.params || !req.params.film || !req.params.thumbnail) {
      next(new Error("Missing required req.params"));
      return;
    }
    const thumbnailResult = await getFilmThumbnail(req.app.db, req.params.film, req.params.thumbnail);
    if (!thumbnailResult) {
      next();
      return;
    }
    const filePath = securePath(GlacierConfig.glacier_thumbnail_storage, req.params.thumbnail);
    if (!filePath) {
      next(new Error("Danger! Resolved path was outside of storage directory!"));
      return;
    }
    // Check if it exists on disk
    access(filePath, constants.F_OK, err => {
      if (err) {
        next(new Error(`Could not locate thumbnail for film ${req.params.film}: ${filePath}`));
        return;
      }
      res.sendFile(filePath, {
        headers: { "Content-Type": thumbnailResult.mime }
      });
    });
  }
  catch (err) {
    next(err);
    return;
  }
}
