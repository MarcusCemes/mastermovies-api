import cookieParser from "cookie-parser";
import { Application } from "express";

/** Parse app cookies */
export default function initialize(app: Application) {
  app.use(cookieParser());
}
