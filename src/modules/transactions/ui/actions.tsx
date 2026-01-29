"use client";

import { FileUp, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function TransactionsActions() {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => router.push("/import")}>
        <FileUp className="mr-2 h-4 w-4" />
        Importar CSV
      </Button>

      <Button size="sm" onClick={() => router.push("/transactions/new")}>
        <Plus className="mr-2 h-4 w-4" />
        Nova transação
      </Button>
    </div>
  );
}
