import Joi from "@hapi/joi";
import merge from "deepmerge";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { GlacierConfig } from "../../../config/glacier";
import { logger } from "../../../lib/logger";
import { HTTP_CODES } from "../../../middleware/respond";
import { Film } from "../../../models/film";
import { Key } from "../../../models/key";
import { LogAuth } from "../../../models/log_auth";
import { ApiContext, ApiSession } from "../../../typings/App";

// Relaxed rate-limiting for all authorisation attempts
export const generalAuthLimiter = new RateLimiterMemory({
  duration: 60,
  points: 60
});

// Strict rate-limiting for failed authorisation attempts
export const badAuthLimiter = new RateLimiterMemory({
  duration: 600,
  points: 10
});

interface IAuthorisationRequest {
  film: number;
  key: string;
}

/** Authorise a download for a given film */
export async function authorise(ctx: ApiContext) {
  ctx.strictCors = true; // Restrict auth to the MasterMovies domain

  // Validate the request payload
  const { error, value } = Joi.object()
    .keys({
      film: Joi.number().required(),
      key: Joi.string()
    })
    .validate<IAuthorisationRequest>(ctx.request.body);

  if (error) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, void 0, {
      error: error.message
    });
    return;
  }

  // Ratelimit all attempts
  try {
    await generalAuthLimiter.consume(ctx.ip);
  } catch (err) {
    ctx.standard(HTTP_CODES.TOO_MANY_REQUESTS, "Too many authorisations");
    return;
  }

  // Ratelimit failed attempts
  try {
    await badAuthLimiter.consume(ctx.ip);
  } catch (err) {
    ctx.standard(HTTP_CODES.TOO_MANY_REQUESTS, "Too many failed authorisation attempts");
    return;
  }

  // Verify credentials
  const authResult = await checkAuthorisation(value.film, value.key);
  if (authResult === AUTH_RESULT.OK) {
    // tslint:disable-next-line:no-floating-promises Let it happen in the queue
    badAuthLimiter.reward(ctx.ip);

    // Authorise the film and add to the session
    ctx.standard(HTTP_CODES.OK);
    const newAuthorisation: ApiSession = {
      glacier: {
        authorisations: {
          [value.film]: Math.floor(Date.now() / 1000) + GlacierConfig.get("authorisationLifetime")
        }
      }
    };
    ctx.setSession(merge(await ctx.getSession(), newAuthorisation));
  } else if (authResult === AUTH_RESULT.EXPIRED) {
    ctx.standard(HTTP_CODES.UNAUTHORIZED, "Key expired");
  } else {
    ctx.standard(HTTP_CODES.UNAUTHORIZED, "Authorisation rejected");
  }

  // Log the authorisation to the database
  // tslint:disable-next-line:no-floating-promises
  logAuthorisation(value.film, value.key, ctx.ip, authResult);
}

enum AUTH_RESULT {
  OK,
  REJECTED,
  EXPIRED,
  NO_RESOURCE
}

/** Check with database if key is valid for the given film */
async function checkAuthorisation(film: number, key: string): Promise<AUTH_RESULT> {
  // Check whether the film access is public
  const resolvedFilm: Film = await Film.query()
    .select(`${Film.tableName}.public`)
    .findById(film);

  if (!resolvedFilm) return AUTH_RESULT.NO_RESOURCE;
  if (resolvedFilm.public === true) return AUTH_RESULT.OK;

  // Check whether the key is valid
  if (!key) return AUTH_RESULT.REJECTED;
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

async function logAuthorisation(filmId: number, keyValue: string, ip: string, authResult: AUTH_RESULT) {
  try {
    const key = await Key.query()
      .select("id")
      .findOne("value", keyValue);
    await LogAuth.query().insertGraph(
      {
        success: authResult === AUTH_RESULT.OK,
        ip,
        film: {
          id: filmId
        },
        key: key || null
      },
      { relate: true }
    );
  } catch (err) {
    logger.error({ msg: "[GLACIER] Unable to log authorisation", err });
  }
}
