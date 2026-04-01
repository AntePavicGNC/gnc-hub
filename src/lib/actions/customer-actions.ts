"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/types/database";

type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];

export async function createCustomer(data: {
  name: string;
  contact_name?: string;
  contact_email?: string;
  contract_status?: "active" | "negotiation" | "paused" | "completed";
  notes?: string;
}) {
  const supabase = await createClient();

  const insert: CustomerInsert = {
    name: data.name,
    contact_name: data.contact_name || null,
    contact_email: data.contact_email || null,
    contract_status: data.contract_status || "active",
    notes: data.notes || null,
  };

  const { data: customer, error } = await supabase
    .from("customers")
    .insert(insert)
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/customers");
  revalidatePath("/pipeline");
  return customer;
}
