import { Application } from "express";
import helmet from "helmet";

/** Secure HTTP headers */
export default function initialize(app: Application) {
  // Add Helmet middleware
  app.use(
    helmet({
      dnsPrefetchControl: false,
      hsts: false
    })
  );
}
