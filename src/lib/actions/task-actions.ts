"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleTaskCompleted(taskId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
}

export async function updateTaskAssignment(
  taskId: string,
  assignedTo: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ assigned_to: assignedTo })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
}
