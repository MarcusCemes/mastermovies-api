import { TApiRouter } from "../../types/App";
import { contact } from "./controllers/contact";
import { endpoint } from "./controllers/endpoint";

export function attachServicesRoutes(router: TApiRouter) {
  router.get("/", endpoint).post("/contact", contact);
}
