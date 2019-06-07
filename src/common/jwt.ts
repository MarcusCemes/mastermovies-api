// MasterMovies API - JWT
// Contains high level and low level functions for JWT
// session manipulation for the API
import jwt from "jsonwebtoken";

import { AuthConfig } from "../config";
import { IJwtPayload } from "../types/express";

/** Low level function to verify a JWT */
export function verifyJwt(token: string): Promise<IJwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      AuthConfig.auth_jwt_secret,
      {
        algorithms: AuthConfig.auth_jwt_algorithm,
        audience: AuthConfig.auth_jwt_audience
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else if (typeof decoded !== "object") {
          reject(new Error("Decoded JWT was not an object"));
        } else {
          resolve(decoded);
        }
      }
    );
  });
}

/** Low level function to sign a JWt */
export function signJwt(token: IJwtPayload): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      token,
      AuthConfig.auth_jwt_secret,
      {
        algorithm: AuthConfig.auth_jwt_algorithm[0],
        audience: AuthConfig.auth_jwt_audience,
        expiresIn: AuthConfig.auth_jwt_lifetime
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

/**
 * High level function to verify a JWT, and extract known properties
 * to ensure a correct ResolvedJWT object.
 */
export async function verifyAndExtractJwt(token: string): Promise<IJwtPayload> {
  const result = await verifyJwt(token);
  if (typeof result !== "object") throw new Error("Bad payload");
  return extractJwt(result as IJwtPayload);
}

/** Low level function to extract known properties from a JWT token */
export function extractJwt(token: IJwtPayload): IJwtPayload {
  if (!token) return {};
  const { glacier } = token;
  return { glacier };
}

/** High level function to test whether can be cleaned/compacted */
export function shouldCleanJwt(token: IJwtPayload): boolean {
  // Test glacier authorizations
  const auths = token.glacier && token.glacier.authorizations;
  if (auths) {
    const currentTime = getEpoch();
    for (const exp of Object.values(auths)) {
      if (exp < currentTime) return true;
    }
  }

  return false;
}

/**
 * High level function to clean up and sign the JWT.
 * Also extends the JWT's lifetime (exp).
 */
export async function cleanAndSignJwt(
  token: IJwtPayload
): Promise<string | null> {
  return signJwt(cleanJwt(token));
}

/**
 * High level function to clean up JWT, compacting and removing expired entries
 * @returns {IJwtPayload} A new object that reflects the given token
 */
export function cleanJwt(token: IJwtPayload): IJwtPayload {
  const newToken: IJwtPayload = {};
  if (typeof token !== "object") return null;

  // Regenerate the glacier object
  if (typeof token.glacier === "object") {
    newToken.glacier = {};

    if (typeof token.glacier.authorizations === "object") {
      newToken.glacier.authorizations = {};
      const currentTime = getEpoch();
      for (const [key, value] of Object.entries(token.glacier.authorizations)) {
        if (typeof value === "number" && value > currentTime) {
          newToken.glacier.authorizations[key] = value;
        }
      }
    }
  }

  return newToken;
}

/** Get the current epoch with second precision */
export function getEpoch(): number {
  return Math.round(Date.now() / 1000);
}
