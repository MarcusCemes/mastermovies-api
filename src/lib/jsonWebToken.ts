import { sign, verify } from "jsonwebtoken";

import { ApiSession } from "../typings/App";

const ALGORITHMS = ["HS256"];
const AUDIENCE = "mastermovies";

/**
 * Low level function to verify a JWT
 * @param {string} token The JWT token to verify
 * @param {string} secret A base64 encoded secret (64 bytes) for signature verification
 * @param {string} jwtid A nonce to add to the JWT
 * @returns {object | false} The decoded JWT payload, or false on verification failure
 */
export function verifyJwt<T extends object>(token: string, secret: string, jwtid?: string): Promise<T | false> {
  return new Promise(resolve => {
    verify(
      token,
      Buffer.from(secret, "base64"),
      { algorithms: ALGORITHMS, audience: AUDIENCE, jwtid },
      (err, decoded) => {
        if (err || typeof decoded !== "object") {
          resolve(false);
          return;
        }
        resolve((decoded as unknown) as T);
      }
    );
  });
}

/**
 * Low level function to sign a JWT.
 * The payload will be stripped from old `exp`, `aud` and `jti`.
 * @param {ApiSession} payload The JWT payload
 * @param {string} secret A base64 encoded secret (64 bytes) for signature signing
 * @param {number} expiresIn The lifetime of the JWT in seconds
 * @param {string} jwtid An optional nonce to add to the JWT
 * @returns {string} The signed JWT token as a base64 encoded string
 * @throws {Error} If the signing process fails
 */
export function signJwt(payload: ApiSession, secret: string, expiresIn: number, jwtid?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { exp, aud, jti, ...cleanPayload } = payload; // remove old metadata, causes errors
    sign(
      cleanPayload,
      Buffer.from(secret, "base64"),
      {
        algorithm: ALGORITHMS[0],
        audience: AUDIENCE,
        expiresIn,
        jwtid
      },
      (err, signed) => {
        if (err) {
          reject(err);
        } else {
          resolve(signed);
        }
      }
    );
  });
}
