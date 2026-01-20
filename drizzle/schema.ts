import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  index
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with additional tables for price comparison system.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: text("password"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  openIdIdx: index("openId_idx").on(table.openId),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - stores all products monitored by Adega Mufs
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  nameIdx: index("product_name_idx").on(table.name),
  categoryIdx: index("product_category_idx").on(table.category),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Competitors table - stores the 4 competitors
 * Fixed: Dinho, Adega Brasil, Franco, Diversos
 */
export const competitors = mysqlTable("competitors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Competitor = typeof competitors.$inferSelect;
export type InsertCompetitor = typeof competitors.$inferInsert;

/**
 * Prices table - stores current prices for each product/competitor combination
 */
export const prices = mysqlTable("prices", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  competitorId: int("competitorId").notNull().references(() => competitors.id, { onDelete: "cascade" }),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  registeredBy: int("registeredBy").notNull().references(() => users.id),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  productCompetitorIdx: index("product_competitor_idx").on(table.productId, table.competitorId),
  productIdx: index("price_product_idx").on(table.productId),
  competitorIdx: index("price_competitor_idx").on(table.competitorId),
}));

export type Price = typeof prices.$inferSelect;
export type InsertPrice = typeof prices.$inferInsert;

/**
 * Price history table - stores all price changes for audit trail
 */
export const priceHistory = mysqlTable("priceHistory", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().references(() => products.id, { onDelete: "cascade" }),
  competitorId: int("competitorId").notNull().references(() => competitors.id, { onDelete: "cascade" }),
  previousValue: decimal("previousValue", { precision: 10, scale: 2 }),
  newValue: decimal("newValue", { precision: 10, scale: 2 }).notNull(),
  changedBy: int("changedBy").notNull().references(() => users.id),
  changeType: mysqlEnum("changeType", ["created", "updated", "deleted"]).notNull(),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("history_product_idx").on(table.productId),
  competitorIdx: index("history_competitor_idx").on(table.competitorId),
  changedAtIdx: index("history_changed_at_idx").on(table.changedAt),
}));

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * Clients table - stores client information
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("client_code_idx").on(table.code),
  nameIdx: index("client_name_idx").on(table.name),
}));

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * SKUs table - stores client's main SKUs (up to 10 per client)
 */
export const skus = mysqlTable("skus", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clientIdx: index("sku_client_idx").on(table.clientId),
  codeIdx: index("sku_code_idx").on(table.code),
}));

export type SKU = typeof skus.$inferSelect;
export type InsertSKU = typeof skus.$inferInsert;

/**
 * Evidence table - stores photos and files related to clients
 */
export const evidence = mysqlTable("evidence", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id, { onDelete: "cascade" }),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(),
  fileSize: int("fileSize").notNull(),
  description: text("description"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
}, (table) => ({
  clientIdx: index("evidence_client_idx").on(table.clientId),
  uploadedAtIdx: index("evidence_uploaded_at_idx").on(table.uploadedAt),
}));

export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = typeof evidence.$inferInsert;
