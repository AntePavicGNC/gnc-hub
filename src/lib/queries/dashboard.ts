import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats(userId: string) {
  const supabase = await createClient();

  const [
    { count: openTasks },
    { count: overdueTasks },
    { count: activeProjects },
    { data: nextDeadlineTask },
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", userId)
      .eq("is_completed", false),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", userId)
      .eq("is_completed", false)
      .lt("deadline", new Date().toISOString()),
    supabase
      .from("video_projects")
      .select("*", { count: "exact", head: true })
      .not("status", "eq", "completed")
      .eq("is_on_hold", false),
    supabase
      .from("tasks")
      .select("deadline")
      .eq("assigned_to", userId)
      .eq("is_completed", false)
      .not("deadline", "is", null)
      .order("deadline", { ascending: true })
      .limit(1)
      .single(),
  ]);

  return {
    openTasks: openTasks ?? 0,
    overdueTasks: overdueTasks ?? 0,
    activeProjects: activeProjects ?? 0,
    nextDeadline: nextDeadlineTask?.deadline ?? null,
  };
}
