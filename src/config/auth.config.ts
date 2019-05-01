import { verifyConfig } from "./util";

export interface IAuthConfig {
  auth_jwt_algorithm: string[];
  auth_jwt_audience: string;
  auth_jwt_secret: Buffer;
  auth_jwt_cookie_name: string;
  auth_jwt_lifetime: number;
}

export const AuthConfig: IAuthConfig = verifyConfig(
  {
    auth_jwt_algorithm: ["HS256"],
    auth_jwt_audience: "mastermovies",
    auth_jwt_cookie_name: "MasterMoviesID",
    auth_jwt_secret: Buffer.from(process.env.AUTH_JWT_SECRET, "hex"),
    auth_jwt_lifetime: 86400 // 24 hours
  }, [
    "auth_jwt_secret"
  ]);
