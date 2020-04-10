import { TApiRouter } from "../../types/App";
import { authorise } from "./controllers/authorise";
import { endpoint } from "./controllers/endpoint";
import { getExport } from "./controllers/getExport";
import { getFilm } from "./controllers/getFilm";
import { getThumbnail } from "./controllers/getThumbnail";
import { listFilms } from "./controllers/listFilms";
import { EType, stream } from "./controllers/stream";

export function attachGlacierRoutes(router: TApiRouter) {
  router
    .get("/", endpoint)

    // Object queries
    .get("/list", listFilms)
    .get("/film/:id", getFilm)
    .get("/export/:id", getExport)
    .get("/thumbnail/:id", getThumbnail)

    // Auth functions
    .post("/authorise", authorise)

    // Binary streaming
    .get("/stream/export/:id", (ctx) => stream(ctx, EType.EXPORT))
    .get("/stream/thumbnail/:id", (ctx) => stream(ctx, EType.THUMBNAIL));
}
