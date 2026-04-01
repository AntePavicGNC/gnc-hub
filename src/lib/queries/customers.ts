import { createClient } from "@/lib/supabase/server";

export type CustomerWithProjects = {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contract_status: string;
  notes: string | null;
  video_projects: { id: string; status: string }[];
};

export async function getCustomers(search?: string): Promise<CustomerWithProjects[]> {
  const supabase = await createClient();
  let query = supabase
    .from("customers")
    .select("id, name, contact_name, contact_email, contract_status, notes, video_projects(id, status)")
    .order("name");

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as CustomerWithProjects[]) ?? [];
}

export async function getCustomerById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
