import {
  users, settings, transactions, otps, customers,
  type User,
  type Settings, type InsertSettings,
  type Transaction, type InsertTransaction,
  type Otp, type Customer, type InsertCustomer
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private settings: Settings | undefined;
  private transactions: Transaction[] = [];
  private customers: Customer[] = [];
  private otps: Otp[] = [];
  private customerIdCounter = 1;
  private transactionIdCounter = 1;
  private otpIdCounter = 1;

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => (u as any).username === username);
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const updated: Settings = { 
      id: 1, 
      fuelPrice: insertSettings.fuelPrice ?? "100.00", 
      discountPerLiter: insertSettings.discountPerLiter ?? "0.70" 
    };
    this.settings = updated;
    return updated;
  }

  async getOrCreateCustomer(phone: string, vehicleNumber?: string): Promise<Customer> {
    let customer = this.customers.find(c => c.phone === phone);
    if (customer) {
      if (vehicleNumber) customer.vehicleNumber = vehicleNumber;
      return customer;
    }
    // For now, continue with internal ID, but server/routes.ts will handle Sheets lookup
    customer = { id: this.customerIdCounter++, phone, vehicleNumber: vehicleNumber || null, createdAt: new Date() };
    this.customers.push(customer);
    return customer;
  }

  async setCustomers(customers: Customer[]) {
    this.customers = customers;
    // Keep counter in sync
    const maxId = Math.max(0, ...customers.map(c => c.id));
    this.customerIdCounter = maxId + 1;
  }

  async getCustomers(): Promise<Customer[]> {
    return this.customers;
  }

  async getCustomerTransactions(customerId: number): Promise<Transaction[]> {
    return this.transactions.filter(t => t.customerId === customerId).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createTransaction(insertTransaction: InsertTransaction & { customerId?: number }): Promise<Transaction> {
    const transaction: Transaction = { 
      id: this.transactionIdCounter++, 
      userId: null,
      authCode: insertTransaction.authCode || null,
      status: insertTransaction.status || 'paid',
      createdAt: new Date(),
      customerId: insertTransaction.customerId ?? null,
      paymentMethod: insertTransaction.paymentMethod ?? null,
      originalAmount: insertTransaction.originalAmount,
      discountAmount: insertTransaction.discountAmount,
      finalAmount: insertTransaction.finalAmount,
      savings: insertTransaction.savings,
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.find(t => t.id === id);
  }

  async updateTransactionStatus(id: number, status: string, authCode?: string): Promise<Transaction> {
    const txn = this.transactions.find(t => t.id === id);
    if (!txn) throw new Error("Not found");
    txn.status = status;
    if (authCode) txn.authCode = authCode;
    return txn;
  }

  async getTransactions(): Promise<Transaction[]> {
    return [...this.transactions].sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getNextOtp(): Promise<Otp | undefined> {
    return this.otps.find(o => !o.isUsed);
  }

  async markOtpUsed(id: number): Promise<void> {
    const otp = this.otps.find(o => o.id === id);
    if (otp) otp.isUsed = true;
  }

  async seedOtps(codes: string[]): Promise<void> {
    codes.forEach(code => {
      this.otps.push({ id: this.otpIdCounter++, code, isUsed: false, createdAt: new Date() });
    });
  }
}

export const storage = new MemStorage();
