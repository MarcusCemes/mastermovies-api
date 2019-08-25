import { ApiRouter } from "../../typings/App";
import { endpoint } from "./controllers/endpoint";
import { logout } from "./controllers/logout";
import { restore } from "./controllers/restore";

export function attachAuthRoutes(router: ApiRouter) {
  router
    .get("/", endpoint)
    .post("/restore", restore)
    .post("/logout", logout);
}
