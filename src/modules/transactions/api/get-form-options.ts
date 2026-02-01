import { supabaseServer } from "@/infrastructure/supabase/server";

export type AccountOption = { id: string; name: string };
export type CategoryOption = { id: string; name: string; kind: "income" | "expense" };

export async function getTransactionFormOptions(): Promise<{
  accounts: AccountOption[];
  categories: CategoryOption[];
}> {
  const supabase = await supabaseServer();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { accounts: [], categories: [] };

  const [{ data: accounts }, { data: categories }] = await Promise.all([
    supabase
      .from("accounts")
      .select("id,name")
      .eq("user_id", auth.user.id)
      .eq("is_archived", false)
      .order("name", { ascending: true }),

    supabase
      .from("categories")
      .select("id,name,kind")
      .eq("user_id", auth.user.id)
      .eq("is_archived", false)
      .order("name", { ascending: true }),
  ]);

  return {
    accounts: (accounts ?? []) as AccountOption[],
    categories: (categories ?? []) as CategoryOption[],
  };
}
