import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/queries/auth";
import { Shield, Workflow, UsersRound, Link2 } from "lucide-react";

const sections = [
  {
    href: "/admin/pipelines",
    label: "Pipelines",
    icon: Workflow,
    description: "Produkttypen und Phasen im Tool bearbeiten.",
  },
  {
    href: "/admin/users",
    label: "User",
    icon: Shield,
    description: "Mitarbeiter verwalten, Rollen setzen, Portal-Einladungen.",
  },
  {
    href: "/admin/teams",
    label: "Teams",
    icon: UsersRound,
    description: "Teams anlegen, Mitglieder zuordnen, Farben setzen.",
  },
  {
    href: "/admin/integrations",
    label: "Integrationen",
    icon: Link2,
    description: "HubSpot, Drive, Calendar — kommt in Phase 2.",
  },
];

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Konfiguriere Pipelines, User, Teams und Integrationen.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
          >
            <div className="rounded-lg bg-accent p-2.5 text-muted-foreground">
              <section.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-medium">{section.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {section.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
