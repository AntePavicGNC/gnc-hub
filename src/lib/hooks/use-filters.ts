"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { ProjectFilters } from "@/lib/queries/projects";

export function useFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: ProjectFilters = {
    creator: searchParams.get("creator") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    priority: searchParams.get("priority") ?? undefined,
    assignee: searchParams.get("assignee") ?? undefined,
    search: searchParams.get("search") ?? undefined,
  };

  const setFilter = useCallback(
    (key: keyof ProjectFilters, value: string | undefined) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return { filters, setFilter, clearFilters, hasActiveFilters };
}
