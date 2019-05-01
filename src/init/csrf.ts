import csurf from "csurf";
import { Application, Request, Response } from "express";
import { AppConfig } from "../config";

/** Protect against HTTP Parameter Pollution */
export default function initialize(app: Application) {

  // Add CSRF validation and secret generation
  app.use(
    csurf({
      cookie: {
        key: "CSRF-Secret",
        secure: true,
        httpOnly: true,
        sameSite: false,
        domain: AppConfig.domain
      },
      value: (req) => req.cookies["CSRF-Token"]
    })
  );

  // Add CSRF token generation
  app.use((req: Request, res: Response, next: () => void) => {
    if (!req.cookies["CSRF-Token"]) {
      res.cookie("CSRF-Token", req.csrfToken(), {
        expires: false,
        secure: true,
        sameSite: false,
        domain: AppConfig.domain,
        path: "/",
        httpOnly: false
      });
    }
    next();
  });
}
