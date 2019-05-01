import { Response } from "express";
import { Pool } from "pg";
import { Readable, Writable } from "stream";

import { warn } from "../../common/logger";
import { incrementViews } from "../../models/glacier";

/**
 * Listen for pipe attachments to a write stream, and attach
 * data counting streams to the stream that is being piped from.
 * When the write stream closes, if the transferred data is above
 * a certain threshold, the view counter for the specified film
 * will be incremented.
 */
export function attachViewIncrementor(res: Response, pool: Pool, fingerprint: string, threshold: number, fileSize: number): void {
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
    });
  };
  res.on("pipe", attachCounter);
  res.once("close", () => {
    if (transferredData > threshold * fileSize) {
      incrementViews(pool, fingerprint).catch(err => {
        warn("Failed to increment film views for " + fingerprint);
        warn("Message: " + err.message);
      });
    }
  });
}
