import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with Replit Auth integration
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username"), // Optional - for password-based auth
  password: varchar("password"), // hashed password for local auth (optional)
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"), // Avatar from gallery
  profileBackgroundUrl: varchar("profile_background_url"), // Background from gallery
  bio: text("bio"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  role: varchar("role", { length: 50 }).default("user").notNull(), // user, moderator, admin
  badge: varchar("badge", { length: 50 }).default("none"), // green_check, red_check, black_check, none
  isBanned: boolean("is_banned").default(false).notNull(), // true = user is banned
  bannedUntil: timestamp("banned_until"), // null = permanent ban, timestamp = temporary ban
  banReason: text("ban_reason"), // reason for ban
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_is_banned").on(table.isBanned),
]);

// User image gallery table
export const userImages = pgTable("user_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  fileName: varchar("file_name"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_user_images_user_id").on(table.userId),
]);

// Wiki entries table
export const wikiEntries = pgTable("wiki_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // approved, pending, rejected
  verification: varchar("verification", { length: 50 }).default("unknown"), // verified, fake, unknown
  isSpecial: boolean("is_special").default(false).notNull(), // true = special/private post
  specialAccessToken: varchar("special_access_token"), // token for API access
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_wiki_entries_user_id").on(table.userId),
  index("idx_wiki_entries_status").on(table.status),
  index("idx_wiki_entries_verification").on(table.verification),
  index("idx_wiki_entries_is_special").on(table.isSpecial),
]);

// Content reports table
export const contentReports = pgTable("content_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").notNull().references(() => wikiEntries.id, { onDelete: "cascade" }),
  reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 100 }).notNull(), // spam, harassment, misinformation, inappropriate, other
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, investigating, resolved, dismissed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_content_reports_entry_id").on(table.entryId),
  index("idx_content_reports_reporter_id").on(table.reporterId),
  index("idx_content_reports_status").on(table.status),
]);

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").notNull().references(() => wikiEntries.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_comments_entry_id").on(table.entryId),
  index("idx_comments_user_id").on(table.userId),
]);

// Likes table
export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entryId: varchar("entry_id").notNull().references(() => wikiEntries.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_likes_entry_id").on(table.entryId),
  index("idx_likes_user_id").on(table.userId),
  // Unique constraint: one user can only like an entry once
  sql`UNIQUE (entry_id, user_id)`,
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wikiEntries: many(wikiEntries),
  images: many(userImages),
  reports: many(contentReports),
  comments: many(comments),
  likes: many(likes),
}));

export const userImagesRelations = relations(userImages, ({ one }) => ({
  user: one(users, {
    fields: [userImages.userId],
    references: [users.id],
  }),
}));

export const wikiEntriesRelations = relations(wikiEntries, ({ one, many }) => ({
  user: one(users, {
    fields: [wikiEntries.userId],
    references: [users.id],
  }),
  reports: many(contentReports),
  comments: many(comments),
  likes: many(likes),
}));

export const contentReportsRelations = relations(contentReports, ({ one }) => ({
  entry: one(wikiEntries, {
    fields: [contentReports.entryId],
    references: [wikiEntries.id],
  }),
  reporter: one(users, {
    fields: [contentReports.reporterId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  entry: one(wikiEntries, {
    fields: [comments.entryId],
    references: [wikiEntries.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  entry: one(wikiEntries, {
    fields: [likes.entryId],
    references: [wikiEntries.id],
  }),
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}));

// User schemas
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserImage = typeof userImages.$inferSelect;

// Wiki entry schemas
export const insertWikiEntrySchema = createInsertSchema(wikiEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateWikiEntrySchema = createInsertSchema(wikiEntries)
  .omit({
    id: true,
    userId: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial()
  .strict(); // Reject any extra fields including status

export type InsertWikiEntry = z.infer<typeof insertWikiEntrySchema>;
export type UpdateWikiEntry = z.infer<typeof updateWikiEntrySchema>;
export type WikiEntry = typeof wikiEntries.$inferSelect;

// Content report schemas
export const insertContentReportSchema = createInsertSchema(contentReports).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertContentReport = z.infer<typeof insertContentReportSchema>;
export type ContentReport = typeof contentReports.$inferSelect;

// Comments & Likes types
export type Comment = typeof comments.$inferSelect;
export type Like = typeof likes.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export type InsertLike = z.infer<typeof insertLikeSchema>;

// User with entries for profile view
export type UserWithEntries = User & {
  wikiEntries: WikiEntry[];
};
