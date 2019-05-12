import { Response } from "express";

/** Set cache control headers */
export function cacheHeaders(res: Response, time: number | false): void {

  if (time === false) {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
  } else {
    res.header("Cache-Control", "max-age=" + Math.ceil(time));
  }

}