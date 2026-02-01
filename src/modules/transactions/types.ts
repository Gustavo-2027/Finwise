// src/modules/transactions/types.ts
import type { Database } from "@/shared/types/database.types";

export type TransactionType = Database["public"]["Enums"]["transaction_type"];
export type TransactionStatus = Database["public"]["Enums"]["transaction_status"];

export type TxTypeFilter = "all" | TransactionType;
export type TxStatusFilter = "all" | TransactionStatus;

export type MonthFilter = "this-month" | "last-month" | "next-month" | string; // YYYY-MM

export type TransactionRow = {
  id: string;
  title: string;
  type: TransactionType;
  status: TransactionStatus;
  occurredAt: string;
  amountCents: number;
  accountName: string;
  categoryName: string;
};
