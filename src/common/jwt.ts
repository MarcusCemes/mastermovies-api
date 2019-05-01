import jwt from "jsonwebtoken";
import { AuthConfig } from "../config";
import { ResolvedJWT } from "../types/express";


/** Low level function to verify a JWT */
export function verifyJwt(token: string): Promise<string | object> {
  return new Promise((resolve, reject) => {

    jwt.verify(token, AuthConfig.auth_jwt_secret, {
      algorithms: AuthConfig.auth_jwt_algorithm,
      audience: AuthConfig.auth_jwt_audience,
    }, (err, decoded) => {

      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }

    });

  });
}

/** Low level function to sign a JWt */
export function signJwt(token: string | object | Buffer): Promise<string> {
  return new Promise((resolve, reject) => {

    jwt.sign(token, AuthConfig.auth_jwt_secret, {
      algorithm: AuthConfig.auth_jwt_algorithm[0],
      audience: AuthConfig.auth_jwt_audience,
      expiresIn: AuthConfig.auth_jwt_lifetime
    }, (err, signed) => {

      if (err) {
        reject(err);
      } else {
        resolve(signed);
      }

    });

  });
}

/**
 * High level function to verify a JWT, and extract known properties
 * to ensure a correct ResolvedJWT object.
 */
export async function parseJwt(token: string): Promise<ResolvedJWT> {

  const result = await verifyJwt(token);
  if (typeof result !== "object") throw new Error("Bad payload");
  const { glacier } = result as ResolvedJWT;
  return { glacier };

}

/**
 * High level function to clean up and sign the JWT.
 * Can be used to extend a JWT's lifetime.
 */
export async function updateJwt(token: ResolvedJWT): Promise<string | null> {

  const newToken: ResolvedJWT = {};
  if (typeof token !== "object") return null;

  // Cleanly clone the token
  if (typeof token.glacier === "object") {
    newToken.glacier = {};

    if (typeof token.glacier.authorizations === "object") {
      newToken.glacier.authorizations = {};
      const currentTime = Math.round(Date.now() / 1000);
      for (const [key, value] of Object.entries(token.glacier.authorizations)) {
        if (typeof value === "number" && value > currentTime) {
          newToken.glacier.authorizations[key] = value;
        }
      }
    }
  }

  return signJwt(newToken);

}