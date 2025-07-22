// This file runs on the server side before rendering the page

import { supabaseAdmin } from "$lib/db";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url }) => {
  const id = Number(params.id); // Get `id` from the URL param
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = 5;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabaseAdmin
    .from("fpr_answers")
    .select(
      `
        answer_id,
        created_at,
        forms (
          title
        )
    `,
      { count: "exact" }
    )
    .eq("sc_id", id)
    .range(from, to);

  if (error) {
    console.error(error);
    return { fprData: [] };
  }

  return {
    fprData: data,
    totalPages: Math.ceil((count ?? 0) / pageSize),
    currentPage: page,
  };
};
