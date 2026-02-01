"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { id: string; name: string };

type MatchType = "contains" | "starts_with" | "regex";
type ApplyType = "all" | "income" | "expense";

const MATCH_TYPES: readonly MatchType[] = ["contains", "starts_with", "regex"];
const APPLY_TYPES: readonly ApplyType[] = ["all", "income", "expense"];

function isMatchType(v: string): v is MatchType {
  return (MATCH_TYPES as readonly string[]).includes(v);
}

function isApplyType(v: string): v is ApplyType {
  return (APPLY_TYPES as readonly string[]).includes(v);
}

export function RuleCreateForm(props: {
  accounts: Option[];
  categories: Option[];
  action: (formData: FormData) => void;
}) {
  const { accounts, categories, action } = props;

  const [matchType, setMatchType] = useState<MatchType>("contains");
  const [applyType, setApplyType] = useState<ApplyType>("all");
  const [accountId, setAccountId] = useState<string>("__all__");
  const [categoryId, setCategoryId] = useState<string>("__none__");

  const accountIdToSubmit = useMemo(
    () => (accountId === "__all__" ? "" : accountId),
    [accountId],
  );
  const categoryIdToSubmit = useMemo(
    () => (categoryId === "__none__" ? "" : categoryId),
    [categoryId],
  );

  return (
    <form action={action} className="space-y-4">
      {/* Campos que vão para o FormData, mantendo contrato estável com o backend */}
      <input type="hidden" name="is_enabled" value="true" />
      <input type="hidden" name="match_type" value={matchType} />
      <input type="hidden" name="apply_type" value={applyType} />
      <input type="hidden" name="account_id" value={accountIdToSubmit} />
      <input type="hidden" name="category_id" value={categoryIdToSubmit} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome (opcional)</Label>
          <Input id="name" name="name" placeholder="Ex: Uber (saídas) • Nubank" />
          <div className="text-xs text-muted-foreground">
            Se vazio, o Valette pode gerar um nome automático no backend.
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="pattern">Padrão</Label>
          <Input
            id="pattern"
            name="pattern"
            placeholder='Ex: "UBER", "IFOOD", "AMAZON"'
            required
          />
          <div className="text-xs text-muted-foreground">
            Para Regex, informe só o padrão (sem / /). Ex:{" "}
            <span className="font-mono">^UBER</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Match</Label>
          <Select
            value={matchType}
            onValueChange={(v) => {
              if (!isMatchType(v)) return;
              setMatchType(v);
            }}
          >
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
          <Select
            value={applyType}
            onValueChange={(v) => {
              if (!isApplyType(v)) return;
              setApplyType(v);
            }}
          >
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
          <Input id="priority" name="priority" type="number" min={0} defaultValue={100} />
          <div className="text-xs text-muted-foreground">
            Menor = aplica primeiro (desempate por data de criação).
          </div>
        </div>

        <div className="space-y-2">
          <Label>Conta (opcional)</Label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Qualquer conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Qualquer conta</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Categoria (opcional)</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Sem categoria (Inbox)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sem categoria (Inbox)</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit">Criar regra</Button>
    </form>
  );
}
