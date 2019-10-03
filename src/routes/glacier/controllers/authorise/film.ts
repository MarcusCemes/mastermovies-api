import Joi from "@hapi/joi";
import merge from "deepmerge";
import { raw } from "objection";
import { RateLimiterMemory } from "rate-limiter-flexible";

import { Config } from "../../../../config";
import { logger } from "../../../../lib/logger";
import { getEpoch } from "../../../../lib/utilities/getEpoch";
import { HTTP_CODES } from "../../../../middleware/respond";
import { Film } from "../../../../models/film";
import { Key } from "../../../../models/key";
import { LogAuth } from "../../../../models/log_auth";
import { IApiContext, IApiSession } from "../../../../types/App";

interface IFilmAuthRequest {
  resourceId: number;
  key: string;
}

// Relaxed rate-limiting for ALL authorisation attempts
export const generalAuthLimiter = new RateLimiterMemory({
  duration: 60,
  points: 60
});

// Strict rate-limiting for failed authorisation attempts
export const badAuthLimiter = new RateLimiterMemory({
  duration: 600,
  points: 10
});

/** A secure authorisation function to gain access to Glacier content */
export async function authoriseFilm(ctx: IApiContext) {
  // Validate the request payload
  const { error, value } = Joi.object()
    .keys({
      resourceId: Joi.number().required(),
      key: Joi.string()
    })
    .unknown(true)
    .validate<IFilmAuthRequest>(ctx.request.body);

  if (error) {
    ctx.standard(HTTP_CODES.BAD_REQUEST, void 0, {
      error: error.message
    });
    return;
  }

  // Rate-limit all attempts as well as a stricter failed attempt limiter
  try {
    await generalAuthLimiter.consume(ctx.ip);
    await badAuthLimiter.consume(ctx.ip);
  } catch (err) {
    ctx.standard(HTTP_CODES.TOO_MANY_REQUESTS, "Too many authorisations");
    return;
  }

  // Verify credentials
  const authResult = await checkAuthorisation(value.resourceId, value.key);
  if (authResult === AUTH_RESULT.OK) {
    // tslint:disable-next-line:no-floating-promises - Can be added to the event queue
    badAuthLimiter.reward(ctx.ip);

    // Authorise the film and update to the session
    ctx.standard(HTTP_CODES.OK, "Authorisation accepted");
    const newAuthorisation: IApiSession = {
      glacier: {
        auth: {
          [value.resourceId]: getEpoch() + Config.get("glacier").auth.film.lifetime
        }
      }
    };
    ctx.session.set(merge(ctx.session.get(), newAuthorisation));

    // tslint:disable-next-line:no-floating-promises
    logView(value.resourceId);
  } else if (authResult === AUTH_RESULT.EXPIRED) {
    ctx.standard(HTTP_CODES.UNAUTHORIZED, "Authorisation expired");
  } else {
    ctx.standard(HTTP_CODES.UNAUTHORIZED, "Authorisation rejected");
  }

  // Log the authorisation to the database
  // tslint:disable-next-line:no-floating-promises
  logAuthorisation(value.resourceId, value.key, ctx.ip, authResult);
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

/** Log the successful/failed authorisation attempt in the database */
async function logAuthorisation(filmId: number, keyValue: string, ip: string, authResult: AUTH_RESULT) {
  try {
    const key = !!keyValue
      ? await Key.query()
          .select("id")
          .findOne("value", keyValue)
      : void 0;
    await LogAuth.query()
      .insertGraph(
        {
          success: authResult === AUTH_RESULT.OK,
          ip,
          film: {
            id: filmId
          },
          key
        },
        { relate: true }
      )
      .skipUndefined();
  } catch (err) {
    logger.error({ msg: "[GLACIER] Unable to log authorisation", err });
  }
}

/** Increment the film view counter */
async function logView(filmId: number) {
  try {
    await Film.query()
      .findById(filmId)
      .patch({ views: raw("views + 1") });
  } catch (err) {
    logger.error({ msg: "Failed to increment film view counter", err });
  }
}
