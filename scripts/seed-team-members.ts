/**
 * Seeds team members into Supabase Auth + public.users.
 * Run with: npx tsx scripts/seed-team-members.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type TeamMember = {
  name: string;
  email: string;
  role: "admin" | "team" | "viewer";
  job_function: "cutter" | "scripter" | "sm_manager" | "backoffice" | "sales" | "admin";
};

const TEAM: TeamMember[] = [
  // Cutter
  { name: "Chris", email: "christopher@goodnewscompany.de", role: "team", job_function: "cutter" },
  { name: "Vlady", email: "vladyslav@goodnewscompany.de", role: "team", job_function: "cutter" },
  { name: "Werkstudent", email: "werkstudent@goodnewscompany.de", role: "team", job_function: "cutter" },
  { name: "Nino", email: "ndl.videoproduction@gmail.com", role: "team", job_function: "cutter" },

  // Social Media Manager
  { name: "Yasmin", email: "yasmin@goodnewscompany.de", role: "team", job_function: "sm_manager" },

  // Scripter
  { name: "Schiar", email: "schiar@goodnewscompany.de", role: "team", job_function: "scripter" },

  // Backoffice
  { name: "Adrienne", email: "adrienne@goodnewscompany.de", role: "team", job_function: "backoffice" },

  // Vertrieb
  { name: "Martin", email: "martin@goodnewscompany.de", role: "team", job_function: "sales" },
  { name: "Flo", email: "florian@goodnewscompany.de", role: "team", job_function: "sales" },
  { name: "Sandro", email: "sandro@goodnewscompany.de", role: "team", job_function: "sales" },
  { name: "Lefti", email: "alexander@goodnewscompany.de", role: "team", job_function: "sales" },

  // Admins (multi-role: Ante = SM + Scripter + Sales + Admin, Jens = Sales + Admin)
  { name: "Ante", email: "ante@goodnewscompany.de", role: "admin", job_function: "admin" },
  { name: "Jens", email: "jens@goodnewscompany.de", role: "admin", job_function: "sales" },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const member of TEAM) {
    // Check if auth user already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", member.email)
      .single();

    if (existing) {
      console.log(`  Uebersprungen (existiert): ${member.name} <${member.email}>`);
      skipped++;
      continue;
    }

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: member.email,
        password: `gnc-temp-${Math.random().toString(36).slice(2, 10)}`,
        email_confirm: true,
        user_metadata: { full_name: member.name },
      });

    if (authError) {
      console.error(`  Auth-Fehler (${member.name}): ${authError.message}`);
      // Maybe auth user exists but public.users doesn't — try to find auth user
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingAuth = listData?.users?.find((u) => u.email === member.email);
      if (existingAuth) {
        // Insert public.users row for existing auth user
        const { error: insertErr } = await supabase.from("users").insert({
          id: existingAuth.id,
          email: member.email,
          name: member.name,
          role: member.role,
          job_function: member.job_function,
        });
        if (!insertErr) {
          console.log(`  Profil erstellt (vorhandener Auth): ${member.name}`);
          created++;
        } else {
          console.error(`  Profil-Fehler: ${insertErr.message}`);
        }
      }
      continue;
    }

    // Create public.users profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: member.email,
      name: member.name,
      role: member.role,
      job_function: member.job_function,
    });

    if (profileError) {
      console.error(`  Profil-Fehler (${member.name}): ${profileError.message}`);
    } else {
      console.log(`  Erstellt: ${member.name} <${member.email}> (${member.job_function})`);
      created++;
    }
  }

  console.log(`\nFertig: ${created} erstellt, ${skipped} uebersprungen`);
}

main().catch(console.error);
