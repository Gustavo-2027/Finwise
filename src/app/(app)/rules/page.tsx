// src/app/(app)/rules/page.tsx

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { createRuleAction } from "@/modules/rules/actions/create-rule";
import { deleteRuleAction } from "@/modules/rules/actions/delete-rule";
import { toggleRuleAction } from "@/modules/rules/actions/toggle-rule";
import { updateRuleAction } from "@/modules/rules/actions/update-rule";
import { getRulesForCurrentUser } from "@/modules/rules/api/get-rules";
import { getRuleFormOptions } from "@/modules/rules/queries/get-rule-form-options";
import { RuleEditDialog } from "@/modules/rules/ui/rule-edit-dialog";
import { RuleRowActions } from "@/modules/rules/ui/rule-row-actions";

function pill(text: string) {
  return (
    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
      {text}
    </span>
  );
}

function formatMatchType(value: string) {
  switch (value) {
    case "contains":
      return "contém";
    case "starts_with":
      return "começa com";
    case "regex":
      return "regex";
    default:
      return value;
  }
}

function formatApplyType(value: string) {
  switch (value) {
    case "all":
      return "todas";
    case "income":
      return "entradas";
    case "expense":
      return "saídas";
    default:
      return value;
  }
}

export default async function RulesPage() {
  const [rules, opts] = await Promise.all([
    getRulesForCurrentUser(),
    getRuleFormOptions(),
  ]);

  const accountNameById = new Map(opts.accounts.map((a) => [a.id, a.name]));
  const categoryNameById = new Map(opts.categories.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-6">
      {/* Create */}
      <Card>
        <CardHeader>
          <CardTitle>Regras</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <form action={createRuleAction} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="pattern">Padrão</Label>
                <Input
                  id="pattern"
                  name="pattern"
                  placeholder='Ex: "UBER", "IFOOD", "AMAZON"'
                  required
                />
                <div className="text-xs text-muted-foreground">
                  Dica: use termos que aparecem no título. Para Regex, informe só o padrão
                  (sem / /). Ex: <span className="font-mono">^UBER</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Match</Label>
                <Select name="matchType" defaultValue="contains">
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de match" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Contém</SelectItem>
                    <SelectItem value="starts_with">Começa com</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aplicar em</Label>
                <Select name="applyType" defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="income">Entradas</SelectItem>
                    <SelectItem value="expense">Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Input
                  id="priority"
                  name="priority"
                  type="number"
                  min={0}
                  defaultValue={100}
                />
                <div className="text-xs text-muted-foreground">
                  Menor = aplica primeiro (desempate por data de criação).
                </div>
              </div>

              <div className="space-y-2">
                <Label>Conta (opcional)</Label>
                <Select name="accountId" defaultValue="__all__">
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Todas as contas</SelectItem>
                    {opts.accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria (opcional)</Label>
                <Select name="categoryId" defaultValue="__none__">
                  <SelectTrigger>
                    <SelectValue placeholder="Sem categoria (Inbox)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem categoria (Inbox)</SelectItem>
                    {opts.categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* MVP: isEnabled como hidden true (padrão). */}
              <input type="hidden" name="isEnabled" value="true" />
            </div>

            <Button type="submit">Criar regra</Button>
          </form>

          <Separator />

          {/* List */}
          {rules.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Você ainda não tem regras. Crie uma acima para categorizar transações
              automaticamente.
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((r) => {
                const accountName = r.accountId ? accountNameById.get(r.accountId) : null;
                const categoryName = r.categoryId
                  ? categoryNameById.get(r.categoryId)
                  : null;

                return (
                  <div
                    key={r.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium">
                          {formatMatchType(r.matchType)}{" "}
                          <span className="text-muted-foreground">→</span>{" "}
                          <span className="font-mono">{r.pattern}</span>
                        </div>

                        {r.isEnabled ? pill("ativa") : pill("inativa")}
                        {pill(`prioridade ${r.priority}`)}
                        {pill(`aplica: ${formatApplyType(r.applyType)}`)}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Conta: {accountName ?? "todas"} • Categoria:{" "}
                        {categoryName ?? "Inbox (sem categoria)"}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Toggle */}
                      <form action={toggleRuleAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input
                          type="hidden"
                          name="nextEnabled"
                          value={r.isEnabled ? "false" : "true"}
                        />
                        <Button type="submit" variant="outline">
                          {r.isEnabled ? "Desativar" : "Ativar"}
                        </Button>
                      </form>

                      {/* Edit */}
                      <RuleEditDialog
                        rule={r}
                        accounts={opts.accounts}
                        categories={opts.categories}
                        updateAction={updateRuleAction}
                      />

                      {/* Delete */}
                      <RuleRowActions ruleId={r.id} deleteAction={deleteRuleAction} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
