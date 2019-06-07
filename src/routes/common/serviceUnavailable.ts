import express, { Request, Response, Router } from "express";

import { statusResponse } from "./statusResponse";

let router: Router;

export function serviceUnavailable() {
  if (router === undefined) {
    router = express.Router().all("/", (_req: Request, res: Response) => {
      statusResponse(res, 503);
    });
  }

  return router;
}
