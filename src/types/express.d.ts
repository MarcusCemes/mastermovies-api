import { Pool } from "pg";

export interface ResolvedJWT {
  error?: string;
  glacier?: { authorizations?: { [index: string]: number } };
  update?: (token: ResolvedJWT) => Promise<boolean>;
}

declare global {
  namespace Express {
    interface Application {
      db: Pool;
    }

    interface Request {
      user?: Promise<ResolvedJWT>;
    }
  }
}
