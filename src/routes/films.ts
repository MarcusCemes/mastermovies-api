import express, { Request, Response, Router } from "express";
import { access, constants } from "fs";
import { parse } from "path";
import { Pool } from "pg";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { Readable, Writable } from "stream";

import { warn } from "../common/logger";
import { rateLimiter } from "../common/rateLimitMiddleware";
import config from "../config/app.config";
import { getFilm, getFilmAuthorization, getFilmDownloadInfo, getFilms, incrementViews } from "../models/films";
import { dataFetcher, getAuthHeader, securePath } from "./common/helpers.js";
import { statusResponse } from "./common/response";

// Create authorization rate limiting
const authRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 600
});
const authLimiter = rateLimiter(authRateLimiter);

export default function create(): Router {
  return express.Router()
    .get("/", dataFetcher(getFilms))
    .get("/:fingerprint", dataFetcher(getFilm))
    .get("/:fingerprint/download/:export", authLimiter, downloadFilm(false))
    .get("/:fingerprint/stream/:export", authLimiter, downloadFilm(true));
}




/**
 * Serve films to client using streams, respecting Range headers and
 * incrementing the view counter after a certain amount of data
 * has been transmitted
 */
export function downloadFilm(stream: boolean = false): (req: Request, res: Response, next: (err?: Error) => void) => Promise<void> {
  return async (req: Request, res: Response, next: (err?: any) => void): Promise<void> => {
    try {
      if (!req.params.fingerprint || !req.params.export) {
        next(new Error("Missing required req.params"));
        return;
      }

      // Verify access authorization
      const token = getAuthHeader(req) || "";
      const authorized = await getFilmAuthorization(req.app.db, req.params.fingerprint, token);
      if (!authorized) {
        statusResponse(res, 401, "This is a protected resource"); // Unauthorized
        return;
      }
      authRateLimiter.reward(req.ip, 1);

      // Contain the path within the film_storage directory
      const filmDownloadInfo = await getFilmDownloadInfo(req.app.db, req.params);
      if (!filmDownloadInfo) {
        next(new Error("Could not obtain film download information"));
        return;
      }
      const { filename, name, release, filesize } = filmDownloadInfo;
      const filePath = securePath(config.film_storage, filename);

      if (!filePath) {
        next(new Error("Danger! Resolved path was outside of storage directory!"));
        return;
      }

      const extension = parse(filePath).ext;

      // Check if it exists on disk and stream it
      access(filePath, constants.F_OK, err => {
        if (err) {
          next(new Error(filePath + " does not exist for export " + req.params.export));
          return;
        } else {

          try {
            attachViewIncrementor(res, req.app.db, req.params.fingerprint, config.view_threshold, filesize);
            if (stream) {
              res.sendFile(filePath);
            } else {
              const downloadName = `${name} (${release.getFullYear()})${extension}`;
              res.download(filePath, downloadName);
            }
          } catch (err) {
            next(err);
            return;
          }

        }

      });

    } catch (err) {
      next(err);
      return;
    }
  }
}

/**
 * Listen for pipe attachments to a write stream, and attach
 * data counting streams to the stream that is being piped from.
 * When the write stream closes, if the transferred data is above
 * a certain threshold, the view counter for the specified film
 * will be incremented.
 */
function attachViewIncrementor(res: Response, pool: Pool, fingerprint: string, threshold: number, fileSize: number) {
  let transferredData = 0;
  const counter = new Writable({
      write: (chunk, _encoding, callback) => {
        transferredData += chunk.length;
        callback();
      }
  });
  const attachCounter = (src: Readable) => {
    src.pipe(counter);
    res.once("close", () => {
      src.unpipe(counter);
    })
  }
  res.on("pipe", attachCounter);
  res.once("close", () => {
    if (transferredData > (threshold * fileSize)) {
      incrementViews(pool, fingerprint).catch((err) => {
        warn("Failed to increment film views for " + fingerprint);
        warn("Message: " + err.message);
      });
    } else {
    }
  });
}



