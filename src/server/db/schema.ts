import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  numeric
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `local_help_${name}`);


export const posts = createTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    skill: varchar("skill", { length: 256 }).notNull(),
    description: varchar("description", { length: 256 }),
    latitude: numeric("latitude", { precision: 10, scale: 6 }).notNull(),
    longitude: numeric("longitude", { precision: 10, scale: 6 }).notNull(),
    userId: varchar("userId", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date()
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.userId),
  })
);


