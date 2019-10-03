import { IApiContext } from "../../../types/App";

export async function endpoint(ctx: IApiContext) {
  ctx.body = {
    message: "MasterMovies API - Glacier Endpoint",
    status: "active"
  };
}
