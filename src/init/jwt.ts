// MasterMovies API - JWT Middleware
// Populate Request.user with a Promise that resolves into
// the JWT payload, an update function (to update the JWT)
// and an optional error. Request.user is frozen!
import { Application, CookieOptions, Request, Response } from "express";

import { cleanAndSignJwt, verifyAndExtractJwt } from "../common/jwt";
import { AppConfig, AuthConfig } from "../config";
import { IJwtPayload } from "../types/express";

const JWT_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  maxAge: AuthConfig.auth_jwt_lifetime * 1000,
  httpOnly: true,
  sameSite: false,
  domain: AppConfig.domain,
  secure: true,
};

/** Add support for asynchronous session decoding/updating */
export default async function initialize(app: Application) {
  app.use((req: Request, res: Response, next: (err?: Error) => void) => {

    // Resolve the user object as a Promise
    req.user = (async () => {

      // Try and read a valid JWT, or start afresh if it's expired/is invalid
      let token: IJwtPayload;
      try {
        const resolvedToken = getToken(req);
        token = resolvedToken ? await verifyAndExtractJwt(resolvedToken) : {};
      } catch (err) {
        res.clearCookie(AuthConfig.auth_jwt_cookie_name, JWT_COOKIE_OPTIONS);
        token = {};
      }

      // Add an update function
      const updateFunction = async (newToken: IJwtPayload) => {
        try {
          const newSignedToken = await cleanAndSignJwt(newToken);
          res.cookie(AuthConfig.auth_jwt_cookie_name, newSignedToken, JWT_COOKIE_OPTIONS);
          return true;
        } catch (err) {
          return false;
        }
      };

      return Object.freeze({ update: updateFunction, data: token });

    })();

    next();

  });
}

function getToken(req: Request): string {

  // Check the headers
  if (req.headers) {
    const header = req.headers.authorization;
    if (header && header.substring(0, 6) === "Bearer") {
      return header.substring(7);
    }
  }

  // Check the query
  if (req.query) {
    const query = req.query.token;
    if (query) return query;
  }

  // Check the cookies
  if (req.cookies) {
    const cookie = req.cookies[AuthConfig.auth_jwt_cookie_name];
    if (cookie) return cookie;
  }

  return null;
}