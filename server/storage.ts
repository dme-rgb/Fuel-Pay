import { db } from "./db";
import {
  users, settings, transactions, otps, customers,
  type User,
  type Settings, type InsertSettings,
  type Transaction, type InsertTransaction,
  type Otp, type Customer, type InsertCustomer
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;

  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;

  getOrCreateCustomer(phone: string, vehicleNumber?: string): Promise<Customer>;
  getCustomerTransactions(customerId: number): Promise<Transaction[]>;

  createTransaction(transaction: InsertTransaction & { customerId?: number }): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  updateTransactionStatus(id: number, status: string, authCode?: string): Promise<Transaction>;
  getTransactions(): Promise<Transaction[]>;
  getCustomers(): Promise<Customer[]>;

  getNextOtp(): Promise<Otp | undefined>;
  markOtpUsed(id: number): Promise<void>;
  seedOtps(codes: string[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined; 
  }

  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings();
    if (existing) {
      const [updated] = await db.update(settings).set(insertSettings).where(eq(settings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(settings).values(insertSettings).returning();
      return created;
    }
  }

  async getOrCreateCustomer(phone: string, vehicleNumber?: string): Promise<Customer> {
    const [existing] = await db.select().from(customers).where(eq(customers.phone, phone));
    if (existing) {
      if (vehicleNumber && existing.vehicleNumber !== vehicleNumber) {
        const [updated] = await db.update(customers)
          .set({ vehicleNumber })
          .where(eq(customers.id, existing.id))
          .returning();
        return updated;
      }
      return existing;
    }
    const [created] = await db.insert(customers).values({ phone, vehicleNumber }).returning();
    return created;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async getCustomerTransactions(customerId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.customerId, customerId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction & { customerId?: number }): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransactionStatus(id: number, status: string, authCode?: string): Promise<Transaction> {
    const [updated] = await db.update(transactions)
      .set({ status, authCode })
      .where(eq(transactions.id, id))
      .returning();
    return updated;
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getNextOtp(): Promise<Otp | undefined> {
    const [otp] = await db.select().from(otps).where(eq(otps.isUsed, false)).limit(1);
    return otp;
  }

  async markOtpUsed(id: number): Promise<void> {
    await db.update(otps).set({ isUsed: true }).where(eq(otps.id, id));
  }

  async seedOtps(codes: string[]): Promise<void> {
    if (codes.length === 0) return;
    await db.insert(otps).values(codes.map(c => ({ code: c, isUsed: false })));
  }
}

export const storage = new DatabaseStorage();
