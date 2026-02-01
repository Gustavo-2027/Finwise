import { cookies } from "next/headers";

export type FlashToast =
  | { type: "success"; title: string; description?: string }
  | { type: "error"; title: string; description?: string };

const COOKIE_NAME = "valette_flash_toast";

export async function setFlashToast(toast: FlashToast) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, JSON.stringify(toast), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10,
  });
}

export async function readFlashToast(): Promise<FlashToast | null> {
  const cookieStore = await cookies();

  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as FlashToast;
  } catch {
    return null;
  }
}

export async function clearFlashToast() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
