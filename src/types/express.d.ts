import { Pool } from "pg";

declare global {
  namespace Express {
    interface Application {
      db: Pool;
    }
  }
}
