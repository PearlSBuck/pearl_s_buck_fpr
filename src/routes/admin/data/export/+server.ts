import { json } from "@sveltejs/kit";
import { supabaseAdmin } from "$lib/db";

export async function POST({ request }) {
  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return json({ error: "No IDs provided" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("fis_answers")
    .select("*") // or be explicit
    .in("sc_id", ids);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(data);
}
