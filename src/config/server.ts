import { createConfig } from "./utils";

export const ServerConfig = createConfig("ServerConfig", {
  env: {
    doc: "The application environment",
    format: String,
    default: "development",
    env: "NODE_ENV"
  },
  ip: {
    doc: "The IP address to bind the server to",
    format: "ipaddress",
    default: "0.0.0.0",
    env: "SERVER_IP"
  },
  port: {
    doc: "The port to bind the server to",
    format: Number,
    default: 3000,
    env: "SERVER_PORT"
  }
});
