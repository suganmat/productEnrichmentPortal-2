import { sql } from 'drizzle-orm';
import { pgTable, text, serial, integer, boolean, json, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categoryMappings = pgTable("category_mappings", {
  id: serial("id").primaryKey(),
  serialNumber: integer("serial_number").notNull(),
  productName: text("product_name").notNull(),
  incomingSellerCategory: json("incoming_seller_category").$type<string[]>().notNull(),
  mlSuggestedCategory: json("ml_suggested_category").$type<string[]>().notNull(),
  selectedCategory: json("selected_category").$type<string[]>().notNull(),
});

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  serialNumber: integer("serial_number").notNull(),
  seller: text("seller").notNull(),
  eeCategory: text("ee_category").notNull(),
  brand: text("brand").notNull(),
  productTags: json("product_tags").$type<Array<{text: string, type: 'group' | 'product', color: 'blue' | 'red'}>>().notNull(),
  groupingLogic: text("grouping_logic").notNull(),
});

export const insertCategoryMappingSchema = createInsertSchema(categoryMappings).omit({
  id: true,
});

export const insertProductVariantSchema = createInsertSchema(productVariants).omit({
  id: true,
});

export type CategoryMapping = typeof categoryMappings.$inferSelect;
export type InsertCategoryMapping = z.infer<typeof insertCategoryMappingSchema>;
export type ProductVariant = typeof productVariants.$inferSelect;
export type InsertProductVariant = z.infer<typeof insertProductVariantSchema>;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth  
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product enrichment table
export const productSKUs = pgTable("product_skus", {
  id: serial("id").primaryKey(),
  mpn: text("mpn").notNull(),
  productName: text("product_name").notNull(),
  dateUploaded: timestamp("date_uploaded").defaultNow(),
  seller: text("seller").notNull(),
  brand: text("brand").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("Saved"),
  availableOnBrandWebsite: boolean("available_on_brand_website").notNull().default(false),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertProductSKUSchema = createInsertSchema(productSKUs).omit({
  id: true,
  dateUploaded: true,
});

export type ProductSKU = typeof productSKUs.$inferSelect;
export type InsertProductSKU = z.infer<typeof insertProductSKUSchema>;
