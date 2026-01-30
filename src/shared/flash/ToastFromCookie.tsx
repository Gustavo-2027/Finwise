"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

type FlashToast =
  | {
      type: "success";
      title: string;
      description?: string;
    }
  | {
      type: "error";
      title: string;
      description?: string;
    };

export function ToastFromCookie({ initialToast }: { initialToast: FlashToast | null }) {
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (!initialToast) return;
    if (hasShownRef.current) return;

    hasShownRef.current = true;

    const commonOptions = {
      description: initialToast.description,
      duration: 4000,
      closeButton: true,
    };

    if (initialToast.type === "success") {
      toast.success(initialToast.title, commonOptions);
    } else {
      toast.error(initialToast.title, commonOptions);
    }
  }, [initialToast]);

  return null;
}
