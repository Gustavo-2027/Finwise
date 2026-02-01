"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RuleRowActions(props: {
  ruleId: string;
  deleteAction: (formData: FormData) => void;
}) {
  const { ruleId, deleteAction } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Excluir
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="space-y-4">
          <DialogHeader>
            <DialogTitle>Excluir regra?</DialogTitle>
            <DialogDescription>Essa ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>

            <form action={deleteAction}>
              <input type="hidden" name="id" value={ruleId} />
              <Button type="submit" variant="destructive">
                Excluir
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
