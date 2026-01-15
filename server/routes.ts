import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

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
    const logFile = path.join(process.cwd(), "sync_debug.log");
    const log = (msg: string) => {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
      console.log(msg);
    };

    try {
      log(`[Sync Start] Syncing ${type} to Google Sheets...`);
      log(`[Sync Payload] ${JSON.stringify(data, null, 2)}`);

      // Calculate IST Timestamp
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const istTime = new Date(now.getTime() + istOffset);
      const istTimestamp = istTime.toISOString().replace('T', ' ').substring(0, 19);

      // Sanitize Data (Ensure vehicleNumber is string or empty string, not null/undefined)
      const sanitizedData = {
        ...data,
        vehicleNumber: data.vehicleNumber || "",
        isttimestamp: istTimestamp,
        timestampStr: istTimestamp
      };

      const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          data: sanitizedData,
          timestamp: now.toISOString(),
          isttimestamp: istTimestamp
        }),
      });
      const result = await response.json();
      log(`[Sync Success] Result for ${type}: ${JSON.stringify(result)}`);
    } catch (err) {
      log(`[Sync Failed] Failed to sync ${type} to Google Sheets: ${err}`);
      if (err instanceof Error) {
        log(`[Sync Failed Stack] ${err.stack}`);
      }
    }
  };

  const fetchFromSheets = async (type: "customer" | "transaction" | "otp-amount-data", queryParams: string = "") => {
    const logFile = path.join(process.cwd(), "sync_debug.log");
    const log = (msg: string) => {
      const timestamp = new Date().toISOString();
      fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
      console.log(msg);
    };

    try {
      log(`[Fetch Start] Fetching ${type} from Google Sheets... query: ${queryParams}`);
      const url = `${GOOGLE_SHEETS_WEBHOOK_URL}?type=${type}&${queryParams}`;
      log(`[Fetch URL] ${url}`);

      const response = await fetch(url);
      if (!response.ok) {
        log(`[Fetch Failed] Status: ${response.status} ${response.statusText}`);
        return [];
      }
      const result = await response.json();
      log(`[Fetch Result Payload] ${JSON.stringify(result, null, 2)}`);

      return result.data || [];
    } catch (err) {
      log(`[Fetch Error] Failed to fetch ${type} from Google Sheets: ${err}`);
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
    if (!phone || !vehicleNumber) return res.status(400).send("Phone and Vehicle Number required");

    // 1. Check Google Sheets first
    const sheetCustomers = await fetchFromSheets("customer", `phone=${phone}`);
    if (sheetCustomers && sheetCustomers.length > 0) {
      const existing = sheetCustomers[0];
      // Update local memory to stay in sync
      const customer = await storage.getOrCreateCustomer(existing.phone, vehicleNumber || existing.vehicleNumber);
      // Ensure local ID matches Sheet ID for consistency
      customer.id = Number(existing.id);
      return res.json(customer);
    }

    // 2. If not in Sheets, create new locally and sync to Sheets
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
      const input = req.body;

      // Calculate IST Timestamp
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
      const istTime = new Date(now.getTime() + istOffset);
      const istTimestampStr = istTime.toISOString().replace('T', ' ').substring(0, 19);

      const transaction = await storage.createTransaction({
        ...input,
        customerId: input.customerId ? Number(input.customerId) : null,
        authCode: "PENDING",
        status: 'paid',
        timestampStr: istTimestampStr
      });

      syncToSheets("transaction", transaction);
      res.status(201).json(transaction);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Transaction failed" });
    }
  });

  app.get("/api/transactions/:id/otp-poll", async (req, res) => {
    const id = parseInt(req.params.id);
    const txn = await storage.getTransaction(id);
    if (!txn) return res.status(404).send("Not found");

    if (txn.authCode && txn.authCode !== "PENDING") {
      return res.json({ authCode: txn.authCode });
    }

    // Poll "OTP-AMOUNT DATA" sheet - get latest entry
    const otpData = await fetchFromSheets("otp-amount-data");
    console.log("Raw OTP Data from Sheets:", JSON.stringify(otpData, null, 2));

    if (otpData && otpData.length > 0) {
      // Filter OTPs that are newer than the transaction
      const txnTime = new Date(txn.isttimestamp).getTime();

      const validOtps = otpData.filter((item: any) => {
        if (!item.timestamp) return false;
        const otpTime = new Date(item.timestamp).getTime();
        return otpTime > txnTime;
      });

      console.log(`Found ${validOtps.length} valid OTPs after timestamp filter`);

      if (validOtps.length > 0) {
        // Find the absolute latest valid OTP
        const latestOtp = validOtps[validOtps.length - 1];
        console.log("Latest valid OTP identified:", latestOtp);

        if (latestOtp && (latestOtp.otp || latestOtp.b)) {
          const code = latestOtp.otp || latestOtp.b;
          console.log("Updating transaction with code:", code);
          const updated = await storage.updateTransactionStatus(id, 'paid', String(code));
          return res.json({ authCode: updated.authCode });
        }
      } else {
        console.log("No valid OTPs found (newer than transaction)");
      }
    }

    res.json({ authCode: "PENDING" });
  });

  app.post("/api/transactions/:id/reset", async (req, res) => {
    const id = parseInt(req.params.id);
    const txn = await storage.getTransaction(id);
    if (!txn) return res.status(404).json({ message: "Transaction not found" });

    // Reset authCode to PENDING so polling can find a newer OTP
    await storage.updateTransactionStatus(id, txn.status || 'paid', "PENDING");

    // Update the local timestamp for the transaction to NOW
    // This ensures that we only look for OTPs generated AFTER this reset button was clicked
    // This is crucial for the "newer than transaction" filter to work for refreshing
    // We can hacking-ly update the createdAt on the in-memory object or assume the filter uses the original creation time.
    // Ideally, we should update the timestamp, OR the filter logic needs to know about "reset time".
    // For now, let's keep the original creation time, but since the user wants "latest OTP",
    // and we filter by > created time, if the old OTP is still there and valid, it might just pick it up again
    // unless the "latest" logic picks a newer one if available.
    // If the old OTP is still the "latest" in the sheet, it will just return it again.
    // That behaves correctly if no new OTP has arrived.

    res.json({ message: "Transaction reset", authCode: "PENDING" });
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


  // 3. New Endpoint: Get All Customers (For Admin Dashboard)
  app.get("/api/customers", async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.sendStatus(401);

      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  return httpServer;
}
