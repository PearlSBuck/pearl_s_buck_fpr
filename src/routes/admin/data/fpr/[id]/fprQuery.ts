import { supabaseAdmin } from "$lib/db";

export async function deleteFPRRecords(ids: number[]) {
  const { error } = await supabaseAdmin
    .from("fpr_answers")
    .delete()
    .in("sc_id", ids); // use .in() for multiple values

  if (error) throw new Error(error.message);
}
