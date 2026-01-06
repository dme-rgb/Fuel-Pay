import { z } from 'zod';
import { insertUserSchema, insertSettingsSchema, insertTransactionSchema, settings, transactions } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/settings',
      input: insertSettingsSchema,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
  transactions: {
    calculate: {
      method: 'POST' as const,
      path: '/api/transactions/calculate',
      input: z.object({ amount: z.number().positive() }),
      responses: {
        200: z.object({
          originalAmount: z.string(),
          finalAmount: z.string(),
          discountAmount: z.string(),
          savings: z.string(),
          fuelPrice: z.string(),
          discountPerLiter: z.string(),
          liters: z.string(),
        }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions',
      input: insertTransactionSchema,
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
      },
    },
    verify: {
      method: 'POST' as const,
      path: '/api/transactions/:id/verify',
      responses: {
        200: z.object({ success: z.boolean(), authCode: z.string() }),
        400: errorSchemas.validation,
      },
    },
    list: {
        method: 'GET' as const,
        path: '/api/transactions',
        responses: {
            200: z.array(z.custom<typeof transactions.$inferSelect>())
        }
    }
  },
  otps: {
    refresh: {
        method: 'POST' as const,
        path: '/api/otps/refresh',
        responses: {
            200: z.object({ message: z.string() })
        }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
