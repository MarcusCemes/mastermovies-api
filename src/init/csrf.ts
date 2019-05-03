import _csrf from "csrf";
import { Application, Request, Response } from "express";

import { AppConfig } from "../config";
import { statusResponse } from "../routes/common/response";

const csrf = new _csrf();
const acceptedMethods = ["GET", "OPTIONS", "HEAD"];
const secretCookie = "CSRF-Secret";
const tokenCookie  = "CSRF-Token";
const tokenHeader  = "CSRF-Token";

/** Protect against Cross Site Request Forgery on state changing requests */
export default function initialize(app: Application) {

  app.use(async (req: Request, res: Response, next: (err?: Error) => void) => {

    // Token must come from a browser-generated source, such as a header
    const secret = req.cookies[secretCookie];
    const token  = req.get(tokenHeader);

    if (!secret) {
      await generateNewTokens(res);
    }

    if (acceptedMethods.indexOf(req.method) === -1) {
      const validity = csrf.verify(secret, token);
      if (!validity) {
        await generateNewTokens(res);
        statusResponse(res, 403, "Bad CSRF token"); // Forbidden
        return;
      }
    }

    next();

  });
}

async function generateNewTokens(res: Response) {

  const secret = await csrf.secret();
  const token  = csrf.create(secret);

  res.cookie(secretCookie, secret, {
    expires: false,
    domain: AppConfig.domain,
    path: "/",
    httpOnly: true,
    secure: true
  });

  res.cookie(tokenCookie, token, {
    expires: false,
    domain: AppConfig.domain,
    path: "/",
    httpOnly: false,  // so it can be read by JavaScript
    secure: true
  });

}