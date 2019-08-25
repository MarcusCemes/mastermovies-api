import { ApiRouter } from "../../typings/App";
import { authorise } from "./controllers/authorise";
import { endpoint } from "./controllers/endpoint";
import { getFilm } from "./controllers/getFilm";
import { listFilms } from "./controllers/listFilms";
import { stream } from "./controllers/stream";
import { thumbnail } from "./controllers/thumbnail";

export function attachGlacierRoutes(router: ApiRouter) {
  router
    .get("/", endpoint)
    .get("/list", listFilms)
    .get("/film/:id", getFilm)

    .post("/authorise", authorise)
    .get("/download/:id", ctx => stream(ctx, true))
    .get("/stream/:id", ctx => stream(ctx, false))

    .get("/thumbnail/:id", thumbnail);
}
