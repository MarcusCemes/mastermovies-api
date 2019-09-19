import { STATUS_CODES } from "http";
import { Context } from "koa";

export enum HTTP_CODES {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  METHOD_NOW_ALLOWED = 405,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  SERVICE_UNAVAILABLE = 503
}

/** Injects ctx with a JSON status response */
export function respondMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    ctx.standard = (code: number, message?: string, additional?: { [index: string]: any }) => {
      ctx.status = code;
      ctx.body = {
        ...ctx.body,
        code,
        status: STATUS_CODES[code] || "<unknown code>",
        message,
        ...additional
      };
    };

    await next();
  };
}
