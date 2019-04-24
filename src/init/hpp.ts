import bodyParser from "body-parser";
import { Application } from "express";
import hpp from "hpp";

/** Protect against HTTP Parameter Pollution */
export default function initialize(app: Application) {

  // Parse the body first
  app.use(bodyParser.urlencoded({ extended: true }));

  // Add the HPP middleware
  app.use(hpp());
}
