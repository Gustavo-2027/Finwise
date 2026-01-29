import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Importante: resolve a sessão e faz refresh se precisar
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const path = req.nextUrl.pathname;

  // Ajuste aqui as rotas que fazem parte do seu (app)
  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/accounts") ||
    path.startsWith("/transactions") ||
    path.startsWith("/import") ||
    path.startsWith("/rules");

  const isAuthRoute = path === "/login" || path === "/register";

  // Se não estiver logado e tentar rota protegida -> /login?next=...
  if (isProtectedRoute && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Se estiver logado e tentar /login ou /register -> /dashboard
  if (isAuthRoute && user) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/accounts/:path*",
    "/transactions/:path*",
    "/import/:path*",
    "/rules/:path*",
    "/login",
    "/register",
  ],
};
