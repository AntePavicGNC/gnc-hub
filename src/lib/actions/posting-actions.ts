"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generatePostingSlots(projectId: string) {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("video_projects")
    .select("video_count, posting_period_start, posting_period_end")
    .eq("id", projectId)
    .single();

  if (!project || !project.posting_period_start || !project.posting_period_end) {
    throw new Error("Posting-Zeitraum muss zuerst gesetzt werden");
  }

  // Delete existing slots for this project
  await supabase.from("posting_slots").delete().eq("project_id", projectId);

  const start = new Date(project.posting_period_start);
  const end = new Date(project.posting_period_end);
  const count = project.video_count || 1;

  const slots = [];
  if (count === 1) {
    slots.push({
      project_id: projectId,
      video_number: 1,
      scheduled_date: project.posting_period_start,
    });
  } else {
    const totalDays = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const interval = totalDays / (count - 1);

    for (let i = 0; i < count; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + Math.round(interval * i));
      slots.push({
        project_id: projectId,
        video_number: i + 1,
        scheduled_date: date.toISOString().split("T")[0],
      });
    }
  }

  const { error } = await supabase.from("posting_slots").insert(slots);
  if (error) throw new Error(error.message);

  revalidatePath(`/pipeline/${projectId}`);
}

export async function updatePostingSlotDate(slotId: string, date: string, projectId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posting_slots")
    .update({ scheduled_date: date, updated_at: new Date().toISOString() })
    .eq("id", slotId);

  if (error) throw new Error(error.message);
  revalidatePath(`/pipeline/${projectId}`);
}

export async function updatePostingSlotStatus(
  slotId: string,
  status: "planned" | "posted" | "skipped",
  projectId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("posting_slots")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", slotId);

  if (error) throw new Error(error.message);
  revalidatePath(`/pipeline/${projectId}`);
}
