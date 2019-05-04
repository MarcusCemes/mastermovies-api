import { Request, Response } from "express";

import { statusResponse } from "./statusResponse";

export function methodNotAllowed(_req: Request, res: Response, _next: (err?: Error) => void) {
  statusResponse(res, 405);
}
