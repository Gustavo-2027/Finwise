// src/modules/rules/schemas/rule.schema.ts

import { z } from "zod";

export const ruleMatchTypeSchema = z.enum(["contains", "starts_with", "regex"]);
export const ruleApplyTypeSchema = z.enum(["all", "income", "expense"]);

export const ruleFormSchema = z
  .object({
    isEnabled: z.coerce.boolean().default(true),
    priority: z.coerce.number().int().min(0, "Prioridade precisa ser >= 0").default(100),

    matchType: ruleMatchTypeSchema,
    pattern: z.string().trim().min(1, "Informe um padrão para a regra."),

    applyType: ruleApplyTypeSchema.default("all"),

    // aqui entram como string|null já normalizados pela action
    accountId: z.string().trim().nullable().optional(),
    categoryId: z.string().trim().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.matchType !== "regex") return;

    try {
      // valida compilação. Flags ficam a cargo do engine (normalmente "i").

      new RegExp(val.pattern);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pattern"],
        message:
          "Regex inválida. Exemplo: ^UBER ou (IFOOD|RAPPI). Remova barras /.../ e informe só o padrão.",
      });
    }
  });

export type RuleFormInput = z.infer<typeof ruleFormSchema>;
