import { IApiContext } from "../../../types/App";

export async function endpoint(ctx: IApiContext) {
  ctx.body = {
    ...ctx.body,
    message: "MasterMovies API - Website Services Endpoint",
    status: "active"
  };
}
