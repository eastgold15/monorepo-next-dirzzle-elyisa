import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/**/*.schema.ts",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: "postgres://gina_user:gina_password@localhost:5432/gina_dev",
  },
});