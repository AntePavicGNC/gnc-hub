"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "@/lib/actions/auth-actions";
import { APP_NAV_ITEMS, filterNavItems } from "./nav-items";
import type { User } from "@/lib/types/database";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function MobileNav({ user }: { user: User }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = filterNavItems(APP_NAV_ITEMS, user);

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-sidebar px-4 lg:hidden">
      <img src="/logos/gnc-logo-blue.svg" alt="GNC" className="h-7 w-auto" />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="rounded-md p-2 hover:bg-accent transition-colors">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center border-b border-border px-5">
              <img
                src="/logos/gnc-logo-blue.svg"
                alt="GNC"
                className="h-7 w-auto"
              />
            </div>

            <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-accent text-primary"
                        : "text-foreground/70 hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                </div>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
