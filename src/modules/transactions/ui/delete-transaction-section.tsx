"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function shortId(id: string) {
  if (!id) return "";
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function DeleteSubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={disabled || pending}
      className="min-w-40 gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Excluindo..." : "Excluir definitivamente"}
    </Button>
  );
}

export function DeleteTransactionSection({
  transactionId,
  action,
  onCancel,
}: {
  transactionId: string;
  action: (formData: FormData) => void;
  onCancel?: () => void;
}) {
  const [isArmed, setIsArmed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const canDelete = useMemo(
    () => Boolean(transactionId) && confirmed,
    [transactionId, confirmed],
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={transactionId} />

      <section className="rounded-2xl border bg-card/70 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/55">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">Zona de risco</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Excluir remove a transação permanentemente.
              {transactionId ? (
                <>
                  {" "}
                  <span className="inline-flex items-center rounded-full border bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                    ID {shortId(transactionId)}
                  </span>
                </>
              ) : null}
            </p>
          </div>

          {/* CTA primária só aparece quando NÃO está armado */}
          {!isArmed ? (
            <Button
              type="button"
              variant="outline"
              className={cn(
                "gap-2",
                "border-destructive/30 text-destructive hover:bg-destructive/10",
              )}
              onClick={() => {
                setIsArmed(true);
                setConfirmed(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Excluir…
            </Button>
          ) : null}
        </div>

        {/* Área de confirmação (inline) */}
        {isArmed ? (
          <div
            className={cn(
              "mt-4 rounded-2xl border p-4",
              "border-destructive/25 bg-destructive/[0.05]",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
                  "border border-destructive/25 bg-destructive/10 text-destructive",
                )}
                aria-hidden="true"
              >
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  Confirmar exclusão
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Essa ação <span className="font-medium">não pode ser desfeita</span>.
                </p>
              </div>
            </div>

            {/* Lógica antiga: checkbox name="confirm" */}
            <label
              className={cn(
                "mt-4 flex items-start gap-3 rounded-xl border p-3 text-sm",
                "bg-background/50",
                "transition-colors hover:bg-muted/20",
              )}
            >
              <input
                type="checkbox"
                name="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1"
              />
              <span className="leading-relaxed">
                Eu entendo que esta transação será{" "}
                <strong>excluída permanentemente</strong>.
              </span>
            </label>

            {!confirmed ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Marque a confirmação para habilitar “Excluir definitivamente”.
              </p>
            ) : null}

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setIsArmed(false);
                  setConfirmed(false);
                  onCancel?.();
                }}
              >
                Cancelar
              </Button>

              <DeleteSubmitButton disabled={!canDelete} />
            </div>
          </div>
        ) : null}
      </section>
    </form>
  );
}
