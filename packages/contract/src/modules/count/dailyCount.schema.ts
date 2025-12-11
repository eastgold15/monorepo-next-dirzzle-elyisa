// schema.ts
import { integer, pgTable, text } from "drizzle-orm/pg-core";

export const dailyCounters = pgTable("daily_counters", {
  date: text("date").primaryKey(), // 格式: "20251209"
  count: integer("count").notNull().default(0),
});
