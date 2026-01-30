"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={disabled || pending}
      className="min-w-44"
    >
      {pending ? "Excluindo..." : "Excluir transação"}
    </Button>
  );
}

export function DeleteTransactionSection({
  transactionId,
  action,
}: {
  transactionId: string;
  action: (formData: FormData) => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={transactionId} />

      <section
        className={cn(
          "rounded-xl border border-destructive/30 bg-destructive/5 p-4",
          "space-y-4",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>

          <div>
            <p className="text-sm font-semibold text-destructive">Excluir transação</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Esta ação é permanente e <strong>não pode ser desfeita</strong>.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-lg border bg-background/50 p-3 text-sm">
          <input
            type="checkbox"
            name="confirm"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1"
          />
          <span>
            Eu entendo que esta transação será <strong>excluída permanentemente</strong>.
          </span>
        </label>

        <div className="flex justify-end">
          <DeleteButton disabled={!confirmed} />
        </div>
      </section>
    </form>
  );
}
