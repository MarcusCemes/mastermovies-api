import { getDatabase } from "../database";
import { IApiContext } from "../types/App";

/** Injects ctx with a JSON status response */
export function databaseMiddleware() {
  const db = getDatabase();

  return async (ctx: IApiContext, next: () => Promise<void>) => {
    ctx.db = db;
    await next();
  };
}
