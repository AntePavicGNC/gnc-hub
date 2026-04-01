import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/types/database";

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("pipeline_step")
    .order("sort_order");
  return data ?? [];
}

export async function getMyTasks(userId: string): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("assigned_to", userId)
    .eq("is_completed", false)
    .order("deadline", { ascending: true, nullsFirst: false });
  return data ?? [];
}
