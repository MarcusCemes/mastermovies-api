import { Application, Request, Response } from "express";

import { warn } from "../common/logger";
import { statusResponse } from "../routes/common/statusResponse";

/** 404, CSRF and general error handling */
export default function initialize(app: Application) {
  // Respond to 404 not found errors
  app.use(
    (_req: Request, res: Response, _next: () => void): void => {
      statusResponse(res, 404, "Resource does not exist"); // Not Found
      return;
    }
  );

  app.use((err: any, req: Request, res: Response, _next: () => void) => {

    // Respond to general errors
    warn("Uncaught error in route '" + req.originalUrl + "'");
    warn("Message: " + err.message);
    if (process.env.NODE_ENV === "production") {
      err.stack
        .split("\n")
        .filter(
          v =>
            v.indexOf("mastermovies") !== -1 && v.indexOf("node_modules") === -1
        )
        .forEach(v => warn(v));
    } else {
      warn(err.stack);
    }
    statusResponse(res, 500, "An administrator has been notified"); // Internal Server Error
    return;
  });
}
