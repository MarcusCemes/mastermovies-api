import { TApiRouter } from "../../types/App";
import { endpoint } from "./controllers/endpoint";
import { logout } from "./controllers/logout";
import { restore } from "./controllers/restore";

export function attachAuthRoutes(router: TApiRouter) {
  router.get("/", endpoint).post("/restore", restore).post("/logout", logout);
}
