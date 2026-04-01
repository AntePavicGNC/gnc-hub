import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";

type PostingSlot = Database["public"]["Tables"]["posting_slots"]["Row"];

export async function getPostingSlots(projectId: string): Promise<PostingSlot[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posting_slots")
    .select("*")
    .eq("project_id", projectId)
    .order("video_number", { ascending: true });
  return data ?? [];
}
