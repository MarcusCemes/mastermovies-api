import { verifyConfig } from "./util";

export interface IAppConfig {
  base: string;
  domain: string
  port: number;
  title: string; // Response title/name
}

export const AppConfig: IAppConfig = verifyConfig(
  {
    base: process.env.BASE || "https://api.mastermovies.co.uk/",
    domain: "mastermovies.co.uk",
    port: parseInt(process.env.PORT, 10) || 3000,
    title: "MasterMovies REST v2"
  },
  ["base", "domain", "port", "title"]
);
