"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { logClientEvent } from "@/lib/client-logger";

export function AppRouteLogger() {
  const pathname = usePathname();

  useEffect(() => {
    logClientEvent("page_view", {
      path:
        typeof window === "undefined"
          ? pathname
          : `${window.location.pathname}${window.location.search}`,
    });
  }, [pathname]);

  return null;
}
