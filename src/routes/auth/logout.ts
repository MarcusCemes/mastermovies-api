import { Request, Response } from "express";

import { AuthConfig } from "../../config";
import { JWT_COOKIE_OPTIONS } from "../../init/jwt";
import { statusResponse } from "../common/statusResponse";

/** Destroy the user's JWT */
export async function logout(
  _req: Request,
  res: Response,
  next: (err?: Error) => void
): Promise<void> {
  try {
    res.clearCookie(AuthConfig.auth_jwt_cookie_name, JWT_COOKIE_OPTIONS);
    statusResponse(res, 200);
  } catch (err) {
    next(err);
  }
}
