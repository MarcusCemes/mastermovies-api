import cookieParser from "cookie-parser";
import csurf from "csurf";
import { Application, Request, Response } from "express";

/** Protect against HTTP Parameter Pollution */
export default function initialize(app: Application) {

  // Parse the CSRF cookies
  app.use(cookieParser());

  // Add CSRF validation and secret generation
  app.use(
    csurf({
      cookie: {
        key: "CSRF-Secret",
        secure: false, // TODO
        httpOnly: true
      }
    })
  );

  // Add CSRF token generation
  app.use((req: Request, res: Response, next: () => void) => {
    res.cookie("CSRF-Token", req.csrfToken());
    next();
  });
}
