import { ApiRouter } from "../../typings/App";
import { contact } from "./controllers/contact";
import { endpoint } from "./controllers/endpoint";

export function attachServicesRoutes(router: ApiRouter) {
  router.get("/", endpoint).post("/contact", contact);
}
