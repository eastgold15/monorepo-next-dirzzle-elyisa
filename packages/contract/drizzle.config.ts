import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/**/*.schema.ts",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: "postgres://gina_user:gina_password@localhost:5432/gina_dev",

    // url: "postgres://user_yDBAhF:password_FXwrTE@139.196.30.42:5432/gina",
  },
});
