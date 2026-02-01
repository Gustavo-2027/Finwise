import type { Database } from "@/shared/types/database.types";

export type TransactionType = Database["public"]["Enums"]["transaction_type"];

export type Transaction = {
  id: string;
  userId: string;

  title: string;
  type: TransactionType;

  occurredAt: string;
  amountCents: number;

  accountId: string | null;
  categoryId: string | null;

  note: string | null;

  createdAt: string;
  updatedAt: string | null;
};
