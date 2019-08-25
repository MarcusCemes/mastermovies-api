import { ApiContext } from "../../../typings/App";

export async function endpoint(ctx: ApiContext) {
  ctx.body = {
    ...ctx.body,
    message: "MasterMovies API - Glacier Endpoint",
    status: "active"
  };
}
