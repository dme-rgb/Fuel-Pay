import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Initialize Settings if not present
  const existingSettings = await storage.getSettings();
  if (!existingSettings) {
    await storage.updateSettings({
      fuelPrice: "100.00",
      discountPerLiter: "0.70"
    });
  }

  // Seed some OTPs if empty (Simulation for Google Sheet)
  const otpCheck = await storage.getNextOtp();
  if (!otpCheck) {
    await storage.seedOtps(["1234", "5678", "9012", "3456", "7890"]);
  }

  app.get(api.settings.get.path, async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxuSJnbjx9PlHqq-Gr7yffrieCyTEHICqxM-fOqIHtW_LpNIl2-ay1EFCzAUMV1sewa/exec";

  const syncToSheets = async (type: "customer" | "transaction", data: any) => {
    try {
      await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, data, timestamp: new Date().toISOString() }),
      });
    } catch (err) {
      console.error(`Failed to sync ${type} to Google Sheets:`, err);
    }
  };

  const fetchFromSheets = async (type: "customer" | "transaction", queryParams: string = "") => {
    try {
      const response = await fetch(`${GOOGLE_SHEETS_WEBHOOK_URL}?type=${type}&${queryParams}`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.data || [];
    } catch (err) {
      console.error(`Failed to fetch ${type} from Google Sheets:`, err);
      return [];
    }
  };

  // Admin route to sync all existing data
  app.post("/api/admin/sync-all", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const customers = await storage.getCustomers();
      const transactions = await storage.getTransactions();
      
      // Sync customers first
      for (const customer of customers) {
        await syncToSheets("customer", customer);
      }
      
      // Sync transactions
      for (const transaction of transactions) {
        await syncToSheets("transaction", transaction);
      }
      
      res.json({ message: "Sync initiated for all records" });
    } catch (err) {
      console.error("Manual sync failed:", err);
      res.status(500).json({ message: "Sync failed" });
    }
  });

  // Customer Login
  app.post("/api/customers/login", async (req, res) => {
    const { phone, vehicleNumber } = req.body;
    if (!phone) return res.status(400).send("Phone required");
    
    // Check Sheets first (if possible) or just sync after local storage update
    const customer = await storage.getOrCreateCustomer(phone, vehicleNumber);
    syncToSheets("customer", customer);
    res.json(customer);
  });

  app.post(api.settings.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const settings = await storage.updateSettings(req.body);
    res.json(settings);
  });

  app.post(api.transactions.calculate.path, async (req, res) => {
    const { amount } = req.body;
    const settings = await storage.getSettings();
    
    if (!settings) {
        return res.status(500).json({ message: "Settings not initialized" });
    }

    const fuelPrice = parseFloat(settings.fuelPrice);
    const discountPerLiter = parseFloat(settings.discountPerLiter);

    if (fuelPrice <= 0) {
         return res.status(400).json({ message: "Invalid fuel price" });
    }

    const liters = amount / fuelPrice;
    const discount = liters * discountPerLiter;
    const finalAmount = amount - discount;

    res.json({
      originalAmount: amount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
      discountAmount: discount.toFixed(2),
      savings: discount.toFixed(2),
      fuelPrice: settings.fuelPrice,
      discountPerLiter: settings.discountPerLiter,
      liters: liters.toFixed(2)
    });
  });

  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = req.body; // Skip strict parse for speed/debugging since schema changed
      
      // Assign Auth Code
      let otp = await storage.getNextOtp();
      
      // Auto-refill simulation if empty
      if (!otp) {
        await storage.seedOtps([
          Math.floor(1000 + Math.random() * 9000).toString(),
          Math.floor(1000 + Math.random() * 9000).toString(),
          Math.floor(1000 + Math.random() * 9000).toString()
        ]);
        otp = await storage.getNextOtp();
      }

      let authCode = otp ? otp.code : "NO-OTP-AVAILABLE";
      if (otp) {
        await storage.markOtpUsed(otp.id);
      }

      const transaction = await storage.createTransaction({
        ...input,
        authCode: authCode,
        status: 'paid'
      });
      
      syncToSheets("transaction", transaction);
      res.status(201).json(transaction);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Transaction failed" });
    }
  });

  app.get(api.transactions.list.path, async (req, res) => {
    // Attempt to get from Sheets if customer context is available
    const customerId = req.query.customerId;
    if (customerId) {
      const sheetData = await fetchFromSheets("transaction", `customerId=${customerId}`);
      if (sheetData.length > 0) {
        return res.json(sheetData);
      }
    }
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });
  
  app.post(api.otps.refresh.path, async (req, res) => {
      // Logic to re-fetch or generate OTPs
      // In production, this would trigger a Google Sheet sync
      await storage.seedOtps([
          Math.floor(1000 + Math.random() * 9000).toString(),
          Math.floor(1000 + Math.random() * 9000).toString()
      ]);
      res.json({ message: "OTPs refreshed" });
  });

  return httpServer;
}
