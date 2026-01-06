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
      const input = api.transactions.create.input.parse(req.body);
      
      // Assign Auth Code
      const otp = await storage.getNextOtp();
      let authCode = otp ? otp.code : "NO-OTP-AVAILABLE";
      if (otp) {
        await storage.markOtpUsed(otp.id);
      }

      // In a real app with Google Sheets, we would fetch from the sheet here.
      // For now, we use the seeded OTPs.
      
      const transaction = await storage.createTransaction({
        ...input,
        authCode: authCode,
        status: 'paid' // Assuming payment gateway success for now
      });
      
      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.transactions.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
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
