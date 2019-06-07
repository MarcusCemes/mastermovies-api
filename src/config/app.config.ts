import { verifyConfig } from "./util";

export interface IAppConfig {
  base: string;
  domain: string;
  port: number;
  title: string; // Response title/name
  encryption_key: Buffer;
}

export const AppConfig: IAppConfig = verifyConfig(
  {
    base: process.env.BASE || "https://api.mastermovies.uk",
    domain: "mastermovies.uk",
    port: parseInt(process.env.PORT, 10) || 3000,
    title: "MasterMovies API [REST] v2",

    encryption_key: Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  },
  ["base", "domain", "port", "title", "encryption_key"]
);
