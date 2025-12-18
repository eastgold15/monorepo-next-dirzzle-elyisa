import { drizzle } from "drizzle-orm/node-postgres";
import { Elysia } from "elysia";
import { env } from "@/env";

import * as dbTable from "./schema";
// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: env.DATABASE_URL,
  },
  schema: dbTable,
});

export const dbPlugin = new Elysia({ name: "db" })
  .decorate("db", db)
  .as("global");
