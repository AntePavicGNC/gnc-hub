import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Database } from "@/lib/types/database";

type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const userName =
        (data.user.user_metadata.full_name as string) ||
        data.user.email!.split("@")[0];
      const userAvatar =
        (data.user.user_metadata.avatar_url as string) || null;

      // Check if user profile exists in public.users
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingUser) {
        // Create profile on first login
        const newUser: UserInsert = {
          id: data.user.id,
          email: data.user.email!,
          name: userName,
          avatar_url: userAvatar,
          role: "team",
          job_function: "admin",
        };
        await supabase.from("users").insert(newUser);
      } else {
        // Update profile picture and name on subsequent logins
        const updates: UserUpdate = {
          name: userName,
          avatar_url: userAvatar,
        };
        await supabase.from("users").update(updates).eq("id", data.user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
