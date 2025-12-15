import { relations } from "@repo/contract";
import { drizzle } from "drizzle-orm/node-postgres";
import { Elysia } from "elysia";
import { envConfig } from "@/lib/env/server";

// You can specify any property from the node-postgres connection options
// export const db = drizzle({
//   connection: {
//     connectionString: ,
//   },
//   schema: dbTable,
// });

export const db = drizzle(envConfig.DATABASE_URL, { relations });

export const dbPlugin = new Elysia({ name: "db" })
  .decorate("db", db)
  .as("global");
