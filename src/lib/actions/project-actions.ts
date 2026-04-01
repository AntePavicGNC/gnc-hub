"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database, DefaultTask } from "@/lib/types/database";

type ProjectInsert = Database["public"]["Tables"]["video_projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["video_projects"]["Update"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];

export async function createProject(data: {
  customer_id: string;
  product_type_id: string;
  creator_id?: string;
  video_count?: number;
  location?: "studio" | "on_site";
  desired_post_date?: string;
  latest_post_date?: string;
  title?: string;
}) {
  const supabase = await createClient();

  // Get the first pipeline step for this product type
  const { data: firstStep } = await supabase
    .from("process_templates")
    .select("step_name")
    .eq("product_type_id", data.product_type_id)
    .order("step_order", { ascending: true })
    .limit(1)
    .single();

  const insert: ProjectInsert = {
    customer_id: data.customer_id,
    product_type_id: data.product_type_id,
    creator_id: data.creator_id || null,
    video_count: data.video_count || 1,
    location: data.location || "studio",
    status: firstStep?.step_name || "backoffice",
    desired_post_date: data.desired_post_date || null,
    latest_post_date: data.latest_post_date || null,
    title: data.title || null,
  };

  const { data: project, error } = await supabase
    .from("video_projects")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return project;
}

export async function updateProject(projectId: string, updates: ProjectUpdate) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("video_projects")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
}

export async function updateProjectStatus(
  projectId: string,
  newStatus: string
) {
  const supabase = await createClient();

  // Get the project to find product_type_id and assigned users
  const { data: project } = await supabase
    .from("video_projects")
    .select("product_type_id, assigned_cutter, assigned_scripter, assigned_sm_manager")
    .eq("id", projectId)
    .single();

  if (!project) throw new Error("Projekt nicht gefunden");

  // Update the project status
  const { error: updateError } = await supabase
    .from("video_projects")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (updateError) throw new Error(updateError.message);

  // Get the process template for this step to auto-generate tasks
  const { data: template } = await supabase
    .from("process_templates")
    .select("default_tasks")
    .eq("product_type_id", project.product_type_id)
    .eq("step_name", newStatus)
    .single();

  if (template && template.default_tasks && template.default_tasks.length > 0) {
    // Check if tasks for this step already exist
    const { data: existingTasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("project_id", projectId)
      .eq("pipeline_step", newStatus)
      .limit(1);

    if (!existingTasks || existingTasks.length === 0) {
      const roleToUser: Record<string, string | null> = {
        cutter: project.assigned_cutter,
        scripter: project.assigned_scripter,
        sm_manager: project.assigned_sm_manager,
        backoffice: null, // backoffice tasks are not auto-assigned
      };

      const tasks: TaskInsert[] = (template.default_tasks as DefaultTask[]).map(
        (dt, index) => ({
          project_id: projectId,
          pipeline_step: newStatus,
          title: dt.title,
          assigned_to: dt.default_role ? roleToUser[dt.default_role] ?? null : null,
          estimated_minutes: dt.estimated_minutes || null,
          sort_order: index,
        })
      );

      const { error: taskError } = await supabase.from("tasks").insert(tasks);
      if (taskError) console.error("Task-Erstellung fehlgeschlagen:", taskError);
    }
  }

  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${projectId}`);
}

export async function updateProjectField(
  projectId: string,
  field: keyof ProjectUpdate,
  value: string | number | boolean | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("video_projects")
    .update({ [field]: value, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${projectId}`);
}

export async function toggleProjectHold(projectId: string, isOnHold: boolean) {
  return updateProjectField(projectId, "is_on_hold", isOnHold);
}

export async function toggleProjectRejected(
  projectId: string,
  isRejected: boolean
) {
  return updateProjectField(projectId, "is_rejected", isRejected);
}
