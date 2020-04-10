import { Algorithm, sign, verify } from "jsonwebtoken";

import { IBasicJwtProperties } from "../types/App";

// Supported algorithms. The first index will be used for signing.
const ALGORITHMS: Algorithm[] = ["HS256"];
const AUDIENCE: string = "mastermovies";

/**
 * Low level function to verify a JWT using HMAC
 * @param {string} token The JWT token to verify
 * @param {Buffer} secret The secret to verify the JWT with
 * @param {string} jwtid A nonce to add to the JWT
 * @returns {object | false} The decoded JWT payload, or false on verification failure
 */
export function verifyJwt(token: string, secret: Buffer, jwtid?: string): object | false {
  try {
    const payload = verify(token, secret, { algorithms: ALGORITHMS, audience: AUDIENCE, jwtid });
    if (typeof payload !== "object") return false;
    return payload;
  } catch (err) {
    return false;
  }
}

/**
 * Low level function to sign a JWT using HMAC
 * The payload will be stripped from old `exp`, `aud` and `jti`.
 * @param {object} payload The JWT payload
 * @param {Buffer} secret The secret to sign the JWT with
 * @param {number} expiresIn The lifetime of the JWT in seconds
 * @param {string} jwtid An optional nonce to add to the JWT
 * @returns {string} The signed JWT token as a base64 encoded string
 * @throws {Error} If the signing process fails
 */
export function signJwt<T extends IBasicJwtProperties>(
  payload: T,
  secret: Buffer,
  expiresIn: number,
  jwtid?: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const { exp, aud, jti, ...cleanPayload } = payload; // remove old metadata, causes errors
    sign(
      cleanPayload,
      secret,
      {
        algorithm: ALGORITHMS[0],
        audience: AUDIENCE,
        expiresIn,
        jwtid,
      },
      (err, signed) => {
        if (err) {
          reject(err);
        } else {
          resolve(signed);
        }
      },
    );
  });
}
