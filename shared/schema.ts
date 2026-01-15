import { pgTable, text, serial, numeric, timestamp, boolean, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  fuelPrice: numeric("fuel_price").notNull().default("100"),
  discountPerLiter: numeric("discount_per_liter").notNull().default("0.70"),
});

export const customers = pgTable("customers", {
  id: text("id").primaryKey(), // Changed from serial to text for alphanumeric
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  vehicleNumber: varchar("vehicle_number", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"), // Matches users.id from auth.ts
  customerId: text("customer_id").references(() => customers.id), // Changed reference to text
  originalAmount: numeric("original_amount").notNull(),
  discountAmount: numeric("discount_amount").notNull(),
  finalAmount: numeric("final_amount").notNull(),
  savings: numeric("savings").notNull(),
  paymentMethod: text("payment_method"), // 'cash', 'card', 'upi', 'net_banking'
  authCode: text("auth_code"),
  status: text("status").default("pending"), // 'pending', 'paid', 'verified'
  timestampStr: text("timestamp_str"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

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
}).extend({
  customerId: z.string().optional(),
});

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Otp = typeof otps.$inferSelect;
