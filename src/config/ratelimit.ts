import { Schema } from "convict";

export interface IRateLimitConfig {
  points: number;
  duration: number;
}

export const RateLimitConfig: Schema<IRateLimitConfig> = {
  points: {
    doc: "The number of points an IP is given",
    format: "positiveInt",
    default: 600,
    env: "RATE_LIMIT_POINTS",
  },
  duration: {
    doc: "The duration after which points reset",
    format: "positiveInt",
    default: 60,
    env: "RATE_LIMIT_DURATION",
  },
};
