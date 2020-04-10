import pino, { LoggerOptions } from "pino";

const options: LoggerOptions = {
  level: process.env.NODE_ENV === "production" ? "info" : "trace",
};

/** Simple JSON logger */
export const logger = pino(options);
