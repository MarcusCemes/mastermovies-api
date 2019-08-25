import assert from "assert";

import { createConfig } from "./utils";

const POSITIVE_NUMBER = (x: any) => assert(typeof x === "number" && x >= 0);

export const RateLimitConfig = createConfig("RateLimitConfig", {
  points: {
    doc: "The number of points an IP is given",
    format: POSITIVE_NUMBER,
    default: 300,
    env: "RATE_LIMIT_POINTS"
  },
  duration: {
    doc: "The duration after which points reset",
    format: POSITIVE_NUMBER,
    default: 60,
    env: "RATE_LIMIT_DURATION"
  }
});
