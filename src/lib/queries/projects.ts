import { createClient } from "@/lib/supabase/server";
import type {
  VideoProjectWithRelations,
  ProcessTemplate,
  Creator,
  User,
} from "@/lib/types/database";

export type ProjectFilters = {
  creator?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  search?: string;
};

export async function getProjects(
  filters?: ProjectFilters
): Promise<VideoProjectWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("video_projects")
    .select(
      `
      *,
      customer:customers!customer_id(id, name),
      creator:creators!creator_id(id, name, short_code, color),
      cutter:users!assigned_cutter(id, name, avatar_url),
      scripter:users!assigned_scripter(id, name, avatar_url),
      sm_manager:users!assigned_sm_manager(id, name, avatar_url)
    `
    )
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.creator) {
    query = query.eq("creator_id", filters.creator);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority) {
    query = query.eq("priority", parseInt(filters.priority));
  }
  if (filters?.assignee) {
    query = query.or(
      `assigned_cutter.eq.${filters.assignee},assigned_scripter.eq.${filters.assignee},assigned_sm_manager.eq.${filters.assignee}`
    );
  }
  if (filters?.search) {
    query = query.or(
      `notes.ilike.%${filters.search}%,customer.name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return (data as unknown as VideoProjectWithRelations[]) ?? [];
}

export async function getProjectById(
  id: string
): Promise<VideoProjectWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("video_projects")
    .select(
      `
      *,
      customer:customers!customer_id(id, name),
      creator:creators!creator_id(id, name, short_code, color),
      cutter:users!assigned_cutter(id, name, avatar_url),
      scripter:users!assigned_scripter(id, name, avatar_url),
      sm_manager:users!assigned_sm_manager(id, name, avatar_url)
    `
    )
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as VideoProjectWithRelations;
}

export async function getCreators(): Promise<Creator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export async function getPipelineSteps(
  productTypeId?: string
): Promise<ProcessTemplate[]> {
  const supabase = await createClient();

  let query = supabase
    .from("process_templates")
    .select("*")
    .order("step_order");

  if (productTypeId) {
    query = query.eq("product_type_id", productTypeId);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getTeamMembers(): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .order("name");
  return data ?? [];
}
