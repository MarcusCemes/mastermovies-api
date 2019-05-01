import { Application } from "express";
import helmet from "helmet";

/** Protect against HTTP Parameter Pollution */
export default function initialize(app: Application) {
  // Add Helmet middleware
  app.use(
    helmet({
      dnsPrefetchControl: false,
      hsts: false
    })
  );
}
