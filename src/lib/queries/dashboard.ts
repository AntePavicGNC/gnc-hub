import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats(userId: string) {
  const supabase = await createClient();

  const [
    { count: openTasks },
    { count: overdueTasks },
    { count: activeProjects },
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
  ]);

  return {
    openTasks: openTasks ?? 0,
    overdueTasks: overdueTasks ?? 0,
    activeProjects: activeProjects ?? 0,
  };
}

export async function getUrgentProjects() {
  const supabase = await createClient();
  const now = new Date();
  const threeDaysFromNow = new Date(now);
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  const cutoff = threeDaysFromNow.toISOString().split("T")[0];

  // Projects with any deadline within 3 days or overdue
  const { data } = await supabase
    .from("video_projects")
    .select(`
      id, title, status, script_deadline, desired_post_date, latest_post_date,
      customer:customers!customer_id(id, name),
      creator:creators!creator_id(id, name, short_code, color)
    `)
    .not("status", "eq", "completed")
    .eq("is_on_hold", false)
    .or(`script_deadline.lte.${cutoff},desired_post_date.lte.${cutoff},latest_post_date.lte.${cutoff}`)
    .order("script_deadline", { ascending: true, nullsFirst: false })
    .order("desired_post_date", { ascending: true, nullsFirst: false })
    .limit(10);

  return data ?? [];
}

export async function getUpcomingDeadlines() {
  const supabase = await createClient();
  const now = new Date();
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const today = now.toISOString().split("T")[0];
  const cutoff = sevenDaysFromNow.toISOString().split("T")[0];

  const { data } = await supabase
    .from("video_projects")
    .select(`
      id, title, status, script_deadline, desired_post_date, latest_post_date,
      customer:customers!customer_id(id, name),
      creator:creators!creator_id(id, name, short_code, color)
    `)
    .not("status", "eq", "completed")
    .eq("is_on_hold", false)
    .or(`script_deadline.gte.${today}.lte.${cutoff},desired_post_date.gte.${today}.lte.${cutoff},latest_post_date.gte.${today}.lte.${cutoff}`)
    .limit(15);

  return data ?? [];
}

export async function getPipelineSummary() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("video_projects")
    .select("status")
    .not("status", "eq", "completed")
    .eq("is_on_hold", false);

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const p of data) {
    counts[p.status] = (counts[p.status] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getWorkloadOverview() {
  const supabase = await createClient();

  const { data: tasks } = await supabase
    .from("tasks")
    .select("assigned_to")
    .eq("is_completed", false)
    .not("assigned_to", "is", null);

  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .order("name");

  if (!tasks || !users) return [];

  const counts: Record<string, number> = {};
  for (const t of tasks) {
    if (t.assigned_to) {
      counts[t.assigned_to] = (counts[t.assigned_to] || 0) + 1;
    }
  }

  return users
    .filter((u) => counts[u.id])
    .map((u) => ({ id: u.id, name: u.name, taskCount: counts[u.id] }))
    .sort((a, b) => b.taskCount - a.taskCount);
}

export async function getRecentlyUpdated() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("video_projects")
    .select(`
      id, title, status, updated_at,
      customer:customers!customer_id(id, name),
      creator:creators!creator_id(id, name, short_code, color)
    `)
    .not("status", "eq", "completed")
    .order("updated_at", { ascending: false })
    .limit(5);

  return data ?? [];
}
