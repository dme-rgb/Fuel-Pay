import { pgTable, text, serial, numeric, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  fuelPrice: numeric("fuel_price").notNull().default("100"),
  discountPerLiter: numeric("discount_per_liter").notNull().default("0.70"),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"), // Matches users.id from auth.ts
  originalAmount: numeric("original_amount").notNull(),
  discountAmount: numeric("discount_amount").notNull(),
  finalAmount: numeric("final_amount").notNull(),
  savings: numeric("savings").notNull(),
  paymentMethod: text("payment_method"), // 'cash', 'card', 'upi', 'net_banking'
  authCode: text("auth_code"),
  status: text("status").default("pending"), // 'pending', 'paid', 'verified'
  createdAt: timestamp("created_at").defaultNow(),
});

export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  id: true, 
  createdAt: true,
  status: true, 
  authCode: true 
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Otp = typeof otps.$inferSelect;
