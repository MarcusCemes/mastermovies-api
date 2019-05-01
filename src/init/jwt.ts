import { Application, Request, Response } from "express";

import { parseJwt, updateJwt } from "../common/jwt";
import { AppConfig, AuthConfig } from "../config";


/** Add support for asynchronous session decoding/updating */
export default async function initialize(app: Application) {
  app.use((req: Request, res: Response, next: (err?: Error) => void) => {


      req.user = (async () => {

      try {
        const resolvedToken = getToken(req);
        const validToken = resolvedToken ? await parseJwt(resolvedToken) : {};

        // Add an update function
        validToken.update = async (token: any) => {
          try {
            const newToken = await updateJwt(token);
            res.cookie(AuthConfig.auth_jwt_cookie_name, newToken, {
              path: "/",
              maxAge: AuthConfig.auth_jwt_lifetime * 1000,
              httpOnly: false,
              sameSite: false,
              domain: AppConfig.domain,
              secure: true
            });
            return true;
          } catch (err) {
            return false;
          }
        };
        return Object.freeze(validToken);

      } catch (err) {
        return { error: err };
      }
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

