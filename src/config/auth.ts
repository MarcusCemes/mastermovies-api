import { Schema } from "convict";
import { randomBytes } from "crypto";

export interface IAuthConfig {
  jwt: {
    secret: Buffer;
    lifetime: number;
    archiveCookie: string;
    jtiCookie: string;
  };
}

export const AuthConfig: Schema<IAuthConfig> = {
  jwt: {
    secret: {
      doc: "The secret used to sign JWT (64 bytes in hex or base64)",
      format: "buffer64",
      default: randomBytes(64),
      env: "AUTH_JWT_SECRET",
      sensitive: true
    },
    lifetime: {
      doc: "The session lifetime/duration (seconds)",
      format: "positiveInt",
      default: 86400,
      env: "AUTH_JWT_LIFETIME"
    },
    archiveCookie: {
      doc: "The cookie where the session is archived",
      format: String,
      default: "MasterMoviesID Token",
      env: "AUTH_JWT_ARCHIVE_COOKIE"
    },
    jtiCookie: {
      doc: "The cookie that stores the session ID to prevent session hijacking",
      format: String,
      default: "MasterMoviesID",
      env: "AUTH_JWT_JTI_COOKIE"
    }
  }
};
