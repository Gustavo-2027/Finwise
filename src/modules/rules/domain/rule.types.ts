// src/modules/rules/domain/rule.types.ts

export type RuleMatchType = "contains" | "starts_with" | "regex";
export type RuleApplyType = "all" | "income" | "expense";

export interface Rule {
  id: string;
  userId: string;

  isEnabled: boolean;
  priority: number;

  matchType: RuleMatchType;
  pattern: string;

  applyType: RuleApplyType;

  accountId: string | null;
  categoryId: string | null;

  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "income" | "expense";

/**
 * O mínimo necessário para o engine decidir.
 * Mantém o domínio independente do formato completo da Transaction.
 */
export interface RulesTransactionInput {
  description: string;
  type: TransactionType;
  accountId: string | null;

  /**
   * Se o usuário setou manualmente, o engine não sobrescreve.
   * Se vier null, o engine tenta encontrar uma categoria.
   */
  categoryId: string | null;
}

export interface RulesApplicationResult {
  matched: boolean;
  matchedRuleId: string | null;
  categoryId: string | null;
}
