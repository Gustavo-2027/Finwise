export type TransactionType = "income" | "expense";

export type TransactionRow = {
  id: string;
  title: string;
  type: TransactionType;
  occurredAt: string;
  amountCents: number;
  accountName: string;
  categoryName: string;
};
