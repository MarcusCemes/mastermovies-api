import { Schema } from "convict";

export interface IServerConfig {
  host: string;
  port: number;
  proxy: boolean;
}

export const ServerConfig: Schema<IServerConfig> = {
  host: {
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
  },
  proxy: {
    doc: "Whether to trust reverse proxy headers",
    format: Boolean,
    default: true,
    env: "SERVER_PROXY"
  }
};
