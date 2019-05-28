import { Application, Request, Response } from "express";
import { cacheHeaders } from "../common/cacheHeaders";


/**
 * Add no-cache headers (needs to be live!)
 */
export default function initialize(app: Application) {

  app.use((_req: Request, res: Response, next: (err?: Error) => void) => {

    cacheHeaders(res, false);
    next();

  });
}
