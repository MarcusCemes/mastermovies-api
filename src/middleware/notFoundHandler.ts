import { IApiContext } from "../types/App";
import { HTTP_CODES } from "./respond";

/** Handle errors, and filter Method Not Implemented and Method Not Allowed errors */
export function notFoundHandler() {
  return async (ctx: IApiContext, next: () => Promise<void>) => {
    await next();
    if (ctx.status === HTTP_CODES.NOT_FOUND && !ctx.body) ctx.standard(HTTP_CODES.NOT_FOUND);
  };
}
