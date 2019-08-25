import { logger } from "../lib/logger";
import { ApiContext } from "../typings/App";
import { HTTP_CODES } from "./respond";

/** Handle errors, and filter Method Not Implemented and Method Not Allowed errors */
export function errorHandler() {
  return async (ctx: ApiContext, next: () => Promise<void>) => {
    try {
      await next();
    } catch (err) {
      if (err.name === "MethodNotAllowedError") {
        ctx.standard(HTTP_CODES.METHOD_NOW_ALLOWED);
      } else if (err.name === "NotImplementedError") {
        ctx.standard(HTTP_CODES.NOT_IMPLEMENTED);
      } else {
        ctx.body = {}; // Remove any other content
        ctx.standard(HTTP_CODES.INTERNAL_SERVER_ERROR, "The incident has been reported. Try again later");
        logger.warn({ msg: `Route error: '${ctx.request.path}'`, err });
      }
    }
  };
}
