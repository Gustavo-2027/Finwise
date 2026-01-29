export type TransactionType = "income" | "expense";

export interface CreateTransactionData {
  title: string;
  amount: number; // número em reais (placeholder). se usar centavos, ajustamos.
  type: TransactionType;
  category: string;
  account: string;
  date: string; // ISO
}

export interface TransactionRow extends CreateTransactionData {
  id: string;
}
