import { Application } from "express";

import routes from "../routes";


/** Attach endpoints as a single router */
export default function initialize(app: Application) {

  app.use(routes());

}