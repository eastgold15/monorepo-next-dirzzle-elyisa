import { drizzle } from "drizzle-orm/node-postgres";
import { Elysia } from "elysia";
import { envConfig } from "@/lib/env/server";
import * as dbTable from "./schema";
// You can specify any property from the node-postgres connection options
export const db = drizzle({
  connection: {
    connectionString: envConfig.DATABASE_URL,
  },
  schema: dbTable,
});

export const dbPlugin = new Elysia({ name: "db" })
  .decorate("db", db)
  .as("global");
