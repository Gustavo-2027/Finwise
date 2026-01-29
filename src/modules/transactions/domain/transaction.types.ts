import type { Database } from "@/shared/types/database.types";

export type TransactionType = Database["public"]["Enums"]["transaction_type"];

export interface TransactionRow {
  id: string;
  title: string;
  account: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
}

export interface TransactionsFilters {
  q?: string;
  month?: string;
  type?: "all" | TransactionType;
  page?: number;
  pageSize?: number;
}

export interface TransactionsResult {
  rows: TransactionRow[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
}
