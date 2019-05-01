import { Request, Response } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { hit } from "../../common/middleware/rateLimiter";
import { AuthConfig } from "../../config";
import { checkFilmAuthorization } from "../../models/auth";
import { ResolvedJWT } from "../../types/express";
import { statusResponse } from "../common/response";

// Create authentication rate limiting
export const authLimiter = new RateLimiterMemory({
  duration: 600,
  points: 10
});

export interface IFilmAuthRequest {
  type: string;
  resource: string;
  key: string;
}

/** Authenticate a user and return a token directly or as a cookie */
export async function authorizeFilm(req: Request, res: Response, next: (err?: Error) => void): Promise<void> {

  const payload: IFilmAuthRequest = req.body;
  if (!payload) {
    statusResponse(res, 400, "Missing payload");
    return;
  }

  const { type, resource, key } = payload;
  if (typeof type !== "string" || typeof resource !== "string" || typeof key !== "string") {
    statusResponse(res, 400, "Malformed authorization request");
    return;
  }

  if (type !== "film") {
    statusResponse(res, 400, "Unknown resource type");
    return;
  }

  const grant = await hit(authLimiter, req.ip, res);
  if (typeof grant !== "function") return;

  try {

    const authorized = await checkFilmAuthorization(req.app.db, resource, key);
    if (authorized === undefined) {
      next();
      grant();
      return;

    } else if (authorized === true) {
      const user = await req.user;
      const newToken = await addAuthorization(resource, user);
      await user.update(newToken);
      statusResponse(res, 200, "Authorization granted");
      grant();
      return;

    } else {
      statusResponse(res, 403, "Credentials rejected");
      return;
    }

  } catch (err) {
    next(err);
    return;
  }
}

/** Add the new film authorization */
async function addAuthorization(film: string, oldToken: ResolvedJWT): Promise<ResolvedJWT> {

  const newToken: ResolvedJWT = { ...oldToken };
  newToken.glacier = newToken.glacier || {};
  newToken.glacier.authorizations = newToken.glacier.authorizations || {};
  newToken.glacier.authorizations[film] = Math.round(Date.now() / 1000) + AuthConfig.auth_jwt_lifetime;

  return newToken;

}