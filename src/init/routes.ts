import express, { Application, Request, Response } from "express";

import { cors } from "../common/middleware/cors";
import { ApplicationRouter } from "../routes";

/** Redirect to the latest version and attach routers */
export default function initialize(app: Application) {

  const rootRouter =express.Router()
    .all("/", cors(), (_req: Request, res: Response, _next: (err?: Error) => void) => { res.redirect("/v2") })
    .use("/v2", ApplicationRouter());

    app.use(rootRouter);
}
