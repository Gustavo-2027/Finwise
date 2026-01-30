"use client";

import { FileUp, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function TransactionsActions() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/import")}
        className="gap-2"
      >
        <FileUp className="h-4 w-4" />
        <span className="hidden sm:inline">Importar CSV</span>
      </Button>

      <Button
        size="sm"
        onClick={() => router.push("/transactions/new")}
        className="gap-2 shadow-sm"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nova transação</span>
      </Button>
    </div>
  );
}
