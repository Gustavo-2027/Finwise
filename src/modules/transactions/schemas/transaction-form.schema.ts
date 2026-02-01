import { z } from "zod";

function normalizeText(v: unknown) {
  return String(v ?? "").trim();
}

function parseBrlToNumber(v: unknown) {
  const raw = normalizeText(v);
  if (!raw) return NaN;

  // "1.234,56" -> "1234.56"
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);

  return Number.isFinite(n) ? n : NaN;
}

/**
 * "" | "__inbox__" | "none" -> null
 * uuid -> uuid
 */
function normalizeCategoryId(v: unknown) {
  const raw = normalizeText(v);
  if (!raw) return null;
  if (raw === "none") return null;
  if (raw === "__inbox__") return null;
  return raw;
}

function isYYYYMMDD(v: unknown) {
  return /^\d{4}-\d{2}-\d{2}$/.test(normalizeText(v));
}

export const createTransactionSchema = z.object({
  title: z.string().trim().min(2, "Informe uma descrição."),

  amount: z.preprocess(
    parseBrlToNumber,
    z.number().finite("Informe um valor válido.").positive("Informe um valor válido."),
  ),

  type: z.enum(["income", "expense"]),

  // default do produto: efetivada
  status: z.enum(["posted", "scheduled"]).default("posted"),

  accountId: z.string().uuid("Conta inválida."),

  categoryId: z.preprocess(
    normalizeCategoryId,
    z.string().uuid("Categoria inválida.").nullable(),
  ),

  date: z
    .string()
    .refine((v) => isYYYYMMDD(v), "Data inválida.")
    .transform((v) => normalizeText(v)),

  note: z
    .string()
    .trim()
    .max(500, "Observação muito longa (máx. 500 caracteres).")
    .optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

export const updateTransactionSchema = createTransactionSchema.extend({
  id: z.string().uuid("ID inválido."),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
