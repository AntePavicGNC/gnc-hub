"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/pipeline": "Video-Pipeline",
  "/customers": "Kunden",
  "/settings": "Einstellungen",
};

export function TopBar() {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ||
    Object.entries(pageTitles).find(([path]) =>
      pathname.startsWith(path + "/")
    )?.[1] ||
    "GNC Hub";

  return (
    <header className="hidden lg:flex h-16 items-center border-b border-border bg-background px-6">
      <h1 className="font-heading text-xl font-bold text-foreground">
        {title}
      </h1>
    </header>
  );
}
