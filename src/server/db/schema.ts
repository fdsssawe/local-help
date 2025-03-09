import { InferSelectModel, sql } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  numeric,
  uuid,
  text,
  pgEnum,
  pgTable,
  boolean,
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

export const chatStatus = pgEnum("chat_status", ["pending", "accepted", "declined"]);

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  post_id: text("post_id").notNull(), // Links to a post
  sender_id: text("sender_id").notNull(), // User who started the chat
  receiver_id: text("receiver_id").notNull(), // Recipient
  status: text("status").default("pending"), // "pending", "accepted"
  created_at: timestamp("created_at").defaultNow(),
});

// ✅ Messages Table (Stored in Supabase, NOT in Drizzle)
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversation_id: text("conversation_id").notNull(), // Links to a conversation
  sender_id: text("sender_id").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const userAddresses = pgTable("user_addresses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  latitude: varchar("latitude", { length: 255 }).notNull(),
  longitude: varchar("longitude", { length: 255 }).notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UserAddress = InferSelectModel<typeof userAddresses>;



