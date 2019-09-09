import Joi from "@hapi/joi";
import merge from "deepmerge";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { GlacierConfig } from "../../../config/glacier";
import { HTTP_CODES } from "../../../middleware/respond";
import { Key } from "../../../models/key";
import { ApiContext, ApiSession } from "../../../typings/App";

// Strict rate-limiting for failed login attempts
export const authLimiter = new RateLimiterMemory({
  duration: 600,
  points: 10
});

interface IAuthorisationRequest {
  film: number;
  key: string;
}

/** Authorise a download for a given film */
export async function authorise(ctx: ApiContext) {

  ctx.cors = false; // Restrict auth to the MasterMovies domain

  // Validate the request payload
  const result = Joi.object()
    .keys({
      film: Joi.number().required(),
      key: Joi.string().required()
    })
    .validate<IAuthorisationRequest>(ctx.request.body);

  if (result.error) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, void 0, {
      error: result.error.message
    });
    return;
  }

  // Ratelimit failed attempts
  try {
    await authLimiter.consume(ctx.ip);
  } catch (err) {
    ctx.standard(HTTP_CODES.TOO_MANY_REQUESTS, "Too many failed login attempts");
    return;
  }

  // Verify credentials
  const authResult = await checkAuthorisation(result.value.film, result.value.key);
  if (authResult === AUTH_RESULT.OK) {
    // tslint:disable-next-line:no-floating-promises
    authLimiter.reward(ctx.ip);

    // Authorise the film and add to the session
    ctx.standard(HTTP_CODES.OK);
    const newAuthorisation: ApiSession = {
      glacier: {
        authorisations: {
          [result.value.film]: Math.floor(Date.now() / 1000) + GlacierConfig.get("authorisationLifetime")
        }
      }
    };
    ctx.setSession(merge(await ctx.getSession(), newAuthorisation));
  } else if (authResult === AUTH_RESULT.EXPIRED) {
    ctx.standard(HTTP_CODES.UNAUTHORIZED, "Key expired");
  } else {
    ctx.standard(HTTP_CODES.UNAUTHORIZED, "Authorisation rejected");
  }
}

const AUTH_RESULT = {
  OK: 0,
  REJECTED: 1,
  EXPIRED: 2
};

/** Check with database if key is valid for the given film */
async function checkAuthorisation(film: number, key: string): Promise<number> {
  const resolvedKey: Partial<Key> = await Key.query()
    .select(`${Key.tableName}.expiry`)
    .where(`${Key.tableName}.value`, key)
    .leftJoinRelation("[films, groups.films]")
    .where(builder => builder.where("films.id", film).orWhere("groups:films.id", film))
    .first();

  if (resolvedKey) {
    if (!resolvedKey.expiry || resolvedKey.expiry > new Date(Date.now())) {
      return AUTH_RESULT.OK;
    } else {
      return AUTH_RESULT.EXPIRED;
    }
  }

  return AUTH_RESULT.REJECTED;
}
