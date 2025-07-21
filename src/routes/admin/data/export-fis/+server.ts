import { json } from "@sveltejs/kit";
import { supabaseAdmin } from "$lib/db";

export async function POST({ request }) {
  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return json({ error: "No IDs provided" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("fis_answers")
    .select(`
      Assisted_By:filled_out_by,
      SC_ID:sc_id,
      SC_Name:sc_name,
      fis_answers_list(
        Question:form_fields!inner(
          Name:label
        ),
        Answer:answer
      )
    `)
    .in("sc_id", ids);

    const reorderedData = data?.map(row => ({
      Assisted_By: row.Assisted_By,
      SC_ID: row.SC_ID,
      SC_Name: row.SC_Name,
      fis_answers_list: row.fis_answers_list.map(answer => ({
        Question: answer.Question, 
        Answer: answer.Answer
      }))
    }));


    console.log(reorderedData);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(reorderedData);
}
