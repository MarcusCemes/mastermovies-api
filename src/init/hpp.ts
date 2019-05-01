import { Application } from "express";
import hpp from "hpp";

/** Protect against HTTP Parameter Pollution */
export default function initialize(app: Application) {
  app.use(hpp());
}
