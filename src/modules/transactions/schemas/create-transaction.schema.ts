import { z } from "zod";

export const createTransactionSchema = z.object({
  title: z.string().trim().min(2, "Informe uma descrição."),
  amount: z.coerce.number().positive("Informe um valor válido."),
  type: z.enum(["income", "expense"]),
  accountId: z.string().uuid("Conta inválida."),
  categoryId: z.string().uuid("Categoria inválida."),
  date: z.string().min(10, "Informe uma data válida."), // yyyy-mm-dd
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
