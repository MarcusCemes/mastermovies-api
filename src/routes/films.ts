import express, { Request, Response, Router } from "express";
import { access, constants } from "fs";
import { parse } from "path";
import { Pool } from "pg";
import { Readable, Writable } from "stream";

import { warning } from "../common/logger";
import config from "../config/app.config";
import { getFilm, getFilmAuthorization, getFilmDownloadInfo, getFilms, incrementViews } from "../models/films";
import { getAuthHeader, jsonFetcher, jsonFetcherWithParameters, securePath } from "./common/helpers.js";
import { statusResponse } from "./common/standardResponses";

export function createFilmsRoute(pool: Pool): Router {
  return express.Router()
    .get("/", jsonFetcher(getFilms, pool))
    .get("/:fingerprint", jsonFetcherWithParameters(getFilm, pool))
    .get("/:fingerprint/download/:export", downloadFilm(pool))
    .get("/:fingerprint/stream/:export", downloadFilm(pool, true))
}




/**
 * Serve films to client using streams, respecting Range headers and
 * incrementing the view counter after a certain amount of data
 * has been transmitted
 */
export function downloadFilm(pool: Pool, stream: boolean = false): (req: Request, res: Response, next: (err?: Error) => void) => Promise<void> {
  return async (req: Request, res: Response, next: (err?: any) => void): Promise<void> => {
    try {
      if (!req.params.fingerprint || !req.params.export) {
        next(new Error("Missing required req.params"));
        return;
      }

      // Verify access authorization
      const token = getAuthHeader(req) || "";
      const authorized = await getFilmAuthorization(pool, req.params.fingerprint, token);
      if (!authorized) {
        statusResponse(res, 401);
        return;
      }

      // Contain the path within the film_storage directory
      const { filename, name, release, filesize } = await getFilmDownloadInfo(req.params, pool);
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
            attachViewIncrementor(res, pool, req.params.fingerprint, config.view_threshold, filesize);
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
        warning("Failed to increment film views for " + fingerprint);
        warning("Message: " + err.message);
      });
    } else {
    }
  });
}