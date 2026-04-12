import { getCurrentUser } from "@/lib/queries/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PortalHomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("id, name")
    .eq("portal_user_id", user.id)
    .maybeSingle();

  const { data: projects } = customer
    ? await supabase
        .from("video_projects")
        .select("id, title, status, desired_post_date, latest_post_date")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Willkommen{customer ? `, ${customer.name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Alle deine Projekte auf einen Blick.
        </p>
      </div>

      {!customer && (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Dein Portal-Zugang ist noch nicht mit einem Kunden verknuepft. Bitte
          melde dich beim GNC-Team.
        </div>
      )}

      {customer && projects && projects.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Noch keine Projekte vorhanden.
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                {p.status}
              </div>
              <div className="mt-2 text-base font-medium">
                {p.title ?? "Ohne Titel"}
              </div>
              {p.desired_post_date && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Wunschdatum: {p.desired_post_date}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
