import assert from "assert";

import { createConfig } from "./utils";

export const AuthConfig = createConfig("AuthConfig", {
  jwtSecret: {
    doc: "The secret used to sign JWT (128 hexadecimal digits)",
    format: secretValidator,
    default: "",
    env: "SESSION_JWT_SECRET"
  },
  lifetime: {
    doc: "The session lifetime/duration (seconds)",
    format: Number,
    default: 86400,
    env: "SESSION_LIFETIME"
  },
  cookie: {
    doc: "The name of the cookie where the session is archived",
    format: String,
    default: "Session",
    env: "SESSION_COOKIE"
  },
  nonceCookie: {
    doc: "The name of the nonce cookie used to secure the JWT",
    format: String,
    default: "SessionID",
    env: "SESSION_NONCE_COOKIE"
  }
});

function secretValidator(x: any) {
  assert(typeof x === "string", "Secret must be a string");
  assert(x.length === 128, "Secret too short (512 bits)");
  assert(/[0-9a-f]+/.test(x), "Secret must be encoded as hexadecimal");
}
