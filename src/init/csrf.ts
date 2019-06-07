import { Application, Request, Response } from "express";

import { generateNewTokens, getCsrfPair } from "../common/middleware/csrf";

/**
 * Inject CSRF tokens and secrets into the response.
 * These should be verified on state-changing routes.
 */
export default function initialize(app: Application) {
  app.use(async (req: Request, res: Response, next: (err?: Error) => void) => {
    const { secret, token } = getCsrfPair(req);

    if (!secret || !token) {
      await generateNewTokens(res);
    }

    next();
  });
}
