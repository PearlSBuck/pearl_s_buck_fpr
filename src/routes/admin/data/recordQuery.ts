// recordQuery.ts
import { supabaseAdmin } from "$lib/db";

export async function getPaginatedSCRecords(page: number, query: string = "") {
  const pageSize = 5;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabaseAdmin
    .from("fis_answers")
    .select("*", { count: "exact" })
    .range(from, to);

  if (query.trim()) {
    request = request.ilike("sc_name", `%${query}%`);
  }

  const { data, count, error } = await request;

  if (error) throw new Error(error.message);

  return {
    records: data ?? [],
    totalPages: Math.ceil((count ?? 0) / pageSize),
    currentPage: page,
  };
}

export async function deleteSCRecords(ids: number[]) {
  const { error } = await supabaseAdmin
    .from("fis_answers")
    .delete()
    .in("sc_id", ids); // use .in() for multiple values

  if (error) throw new Error(error.message);
}
