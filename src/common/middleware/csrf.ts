// MasterMovies API - CSRF Middleware
// Used to create/verify CSRF secret-token pair
import _csrf from "csrf";
import { Request, Response } from "express";

import { AppConfig } from "../../config";
import { statusResponse } from "../../routes/common/statusResponse";
import { decrypt, encrypt } from "../encryption";

const csrfLib = new _csrf();

export const csrfAllowedMethods = ["GET", "OPTIONS", "HEAD"];
export const csrfCookieSecret = "CSRF-Secret";
export const csrfCookieToken  = "CSRF-Token";
export const csrfHeader       = "CSRF-Token";

/** Middleware to verify CSRF tokens on state-changing requests */
export async function csrf(req: Request, res: Response, next: (err?: Error) => void): Promise<void> {

  if (csrfAllowedMethods.indexOf(req.method) === -1) {

    const { secret } = getCsrfPair(req);
    const token      = getCsrfHeader(req);
    const validity   = csrfLib.verify(secret, token);

    if (!validity) {
      await generateNewTokens(res);
      statusResponse(res, 403, "Bad CSRF token"); // Forbidden
      return;
    }

  }

  next();

}

/** Retrieve and decrypt the CSRF token/secret pair from the Request cookies */
export function getCsrfPair(req: Request): { token?: string, secret?: string } {

  try {
    const [ iv, encryptedSecret ] = req.cookies[csrfCookieSecret].split(".");
    const secret = decrypt(encryptedSecret, iv);
    const token = req.cookies[csrfCookieToken];
    return { token, secret };
  } catch (err) {
    return {};
  }

}

export function getCsrfHeader(req: Request): string {
  return req.get(csrfHeader);
}

/** Generate and encrypt a new CSRF token/secret pair and set them as cookies */
export async function generateNewTokens(res: Response) {

  const secret = await csrfLib.secret();
  const token  = csrfLib.create(secret);

  const { iv, data } = encrypt(secret);
  const encryptedSecret = iv + "." + data;

  res.cookie(csrfCookieSecret, encryptedSecret, {
    expires: false,
    domain: AppConfig.domain,
    path: "/",
    httpOnly: true,
    secure: true,
  });

  res.cookie(csrfCookieToken, token, {
    expires: false,
    domain: AppConfig.domain,
    path: "/",
    httpOnly: false,  // so it can be read by JavaScript
    secure: true
  });

}