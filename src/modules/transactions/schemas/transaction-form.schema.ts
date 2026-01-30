import { z } from "zod";

/**
 * Converte "1.234,56" -> 1234.56 (number) e valida.
 */
const moneyNumber = z.preprocess((val) => {
  const raw = String(val ?? "").trim();
  if (!raw) return NaN;

  const normalized = raw.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}, z.number().finite("Informe um valor válido.").positive("Informe um valor válido."));

export const createTransactionSchema = z.object({
  title: z.string().trim().min(2, "Informe uma descrição."),
  amount: moneyNumber,
  type: z.enum(["income", "expense"]),
  accountId: z.string().uuid("Conta inválida."),
  categoryId: z.string().uuid("Categoria inválida."),
  date: z.string().min(10, "Data inválida."),
  note: z
    .string()
    .trim()
    .max(500, "Observação muito longa (máx. 500 caracteres).")
    .optional(),
});
