import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/queries/auth";
import { signOut } from "@/lib/actions/auth-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { LogOut } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "customer") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-6">
          <Link href="/portal" className="flex items-center gap-3">
            <img src="/logos/gnc-logo-blue.svg" alt="GNC" className="h-8 w-auto" />
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              Kunden-Portal
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                title="Abmelden"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-6 lg:py-8">
        {children}
      </main>
      <Toaster />
    </div>
  );
}
