import bodyParser from "body-parser";
import { Application, Request, Response } from "express";

/** HTTP Body Parser */
export default function initialize(app: Application) {
  const parser = bodyParser.json();

  // Catch and ignore errors
  app.use((req: Request, res: Response, next: (err?: Error) => void) => {
    parser(req, res, err => {
      if (err) {
        req.body = {};
      }
      next();
    });
  });
}
