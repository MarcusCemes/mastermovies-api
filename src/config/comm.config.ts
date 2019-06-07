import { verifyConfig } from "./util";

export interface ICommConfig {
  system_email: string;
  operator_email: string;
}

export const CommConfig: ICommConfig = verifyConfig(
  {
    system_email: "MasterMovies <system@mastermovies.uk>",
    operator_email: "marcus@mastermovies.uk"
  },
  ["system_email", "operator_email"]
);
