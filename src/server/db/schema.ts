import { sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  numeric,
  uuid,
  text
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


export const chats = createTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



