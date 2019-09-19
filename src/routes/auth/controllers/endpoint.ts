import { ApiContext } from "../../../typings/App";

export async function endpoint(ctx: ApiContext) {
  ctx.body = {
    message: "MasterMovies API - Authentication Endpoint",
    status: "active"
  };
}
