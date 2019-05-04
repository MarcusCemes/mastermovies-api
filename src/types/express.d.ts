import { Pool } from "pg";

export interface IRequestUser {
  error?: string;
  data: IJwtPayload;
  update: (token: IJwtPayload) => Promise<boolean>;
}

export interface IJwtPayload {
  glacier?: { authorizations?: { [index: string]: number } };
}

declare global {
  namespace Express {
    interface Application {
      db: Pool;
    }

    interface Request {
      user?: Promise<IRequestUser>;
    }
  }
}
