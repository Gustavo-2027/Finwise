import type { Database } from "@/shared/types/database.types";

type RuleRow = Database["public"]["Tables"]["rules"]["Row"];
type TransactionType = Database["public"]["Enums"]["transaction_type"];

export type RuleInput = {
  description: string;
  type: TransactionType;
  accountId: string | null;
  categoryId: string | null;
};

export type RuleApplyResult = {
  categoryId: string | null;
  matchedRuleId: string | null;
};

function normalizeText(s: string) {
  return s.toLowerCase().normalize("NFKD");
}

function matches(rule: RuleRow, input: RuleInput) {
  if (!rule.is_enabled) return false;

  if (rule.apply_type !== "all" && rule.apply_type !== input.type) return false;

  if (rule.account_id && rule.account_id !== input.accountId) return false;

  const hay = normalizeText(input.description);
  const needle = normalizeText(rule.pattern);

  switch (rule.match_type) {
    case "contains":
      return hay.includes(needle);
    case "starts_with":
      return hay.startsWith(needle);
    case "ends_with":
      return hay.endsWith(needle);
    case "equals":
      return hay === needle;
    case "regex": {
      try {
        const re = new RegExp(rule.pattern, "i");
        return re.test(input.description);
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}

export function applyRulesToTransaction(
  input: RuleInput,
  rules: RuleRow[],
): RuleApplyResult {
  const ordered = [...rules].sort((a, b) => a.priority - b.priority);

  for (const rule of ordered) {
    if (!matches(rule, input)) continue;

    return {
      categoryId: rule.category_id ?? null,
      matchedRuleId: rule.id,
    };
  }

  return { categoryId: input.categoryId ?? null, matchedRuleId: null };
}
