import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertTransaction } from "@shared/routes";

// Calculate logic
export function useCalculateTransaction() {
  return useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch(api.transactions.calculate.path, {
        method: api.transactions.calculate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to calculate transaction");
      return api.transactions.calculate.responses[200].parse(await res.json());
    },
  });
}

// Create Transaction
export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      // Ensure numeric fields are strings as per schema if needed, but schema expects numeric
      // Zod schema handles types. 
      const res = await fetch(api.transactions.create.path, {
        method: api.transactions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create transaction");
      return api.transactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] });
    },
  });
}

// List Transactions
export function useTransactions() {
  return useQuery({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const res = await fetch(api.transactions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.transactions.list.responses[200].parse(await res.json());
    },
  });
}

// Verify Transaction (Admin/Attendant action usually, or checking status)
export function useVerifyTransaction() {
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.transactions.verify.path, { id });
      const res = await fetch(url, {
        method: api.transactions.verify.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to verify transaction");
      return api.transactions.verify.responses[200].parse(await res.json());
    },
  });
}
