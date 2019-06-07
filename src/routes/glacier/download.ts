import { Request, Response } from "express";
import { access, constants } from "fs";
import { getExtension } from "mime";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { hit, limit } from "../../common/middleware/rateLimiter";
import { GlacierConfig } from "../../config";
import { getFilmDownloadInfo, IFilmDownloadInfo } from "../../models/glacier";
import { securePath } from "../common/helpers.js";
import { statusResponse } from "../common/statusResponse";
import { isValidHex } from "../common/util";
import { attachViewIncrementor } from "./views";
import { cacheHeaders } from "../../common/cacheHeaders";

// Create authorization rate limiting
const _authLimiter = new RateLimiterMemory({
  duration: 600,
  points: 10
});
export const authLimiter = limit(_authLimiter);

/**
 * Serve films to client using streams, respecting Range headers and
 * incrementing the view counter after a certain amount of data
 * has been transmitted
 */
export async function downloadFilm(req: Request, res: Response, next: (err?: any) => void): Promise<void> {

  if (!req.params.film || !req.params.export) {
    next(new Error("Missing required request parameters"));
    return;
  }

  try {

    const filmDownloadInfo = await getFilmDownloadInfo(req.app.db, req.params.film, req.params.export);

    if (!filmDownloadInfo) {
      next();
      return;
    }

    const grant = await hit(_authLimiter, req.ip, res);
    if (typeof grant === "function") {

      const token = (await req.user).data;
      const validAuthorization = token.glacier
        && token.glacier.authorizations
        && token.glacier.authorizations[req.params.film]
        && token.glacier.authorizations[req.params.film] >= Math.round(Date.now()/1000); // to seconds
        if (validAuthorization === true) {
          grant();
          startDownload(filmDownloadInfo, req, res, next);
        } else {
          statusResponse(res, 401, "An access token is required");
          return;
        }

    }

  } catch (err) {
    next(err);
  }
}

/** Start the actual download */
function startDownload(
  info: IFilmDownloadInfo,
  req: Request,
  res: Response,
  next: (err?: Error) => void
) {

  if (!isValidHex(req.params.export)) {
    next(new Error("Danger! Request parameter was unsafe: " + req.params.export.substring(0, 16)));
    return;
  }

  const filePath = securePath(GlacierConfig.glacier_film_storage, req.params.export); // has been sanitized

  if (!filePath) {
    next(new Error("Danger! Resolved path was outside of storage directory!"));
    return;
  }

  const extension = getExtension(info.mime);
  access(filePath, constants.F_OK, err => {

    if (err) {
      next(new Error(`Could not locate file for export ${req.params.export}: ${filePath}`));
      return;
    }

    try {

      attachViewIncrementor(
        res,
        req.app.db,
        req.params.film,
        GlacierConfig.glacier_view_threshold,
        info.size
      );

      cacheHeaders(res, false);

      if (typeof req.query.download === "undefined") {
        res.sendFile(filePath, { headers: { "Content-Type": info.mime } });
      }
      else {
        res.download(filePath, `${info.name} (${info.release.getFullYear()}).${extension}`);
      }

    } catch (err) {
      next(err);
      return;
    }

  });
}