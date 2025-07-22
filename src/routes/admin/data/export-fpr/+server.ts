import { json } from "@sveltejs/kit";
import { supabaseAdmin } from "$lib/db";

type FPRRow = {
  Assisted_By: string;
  SC_ID: number;
  fis_answers: { SC_Name: string }[] | null;
  fpr_answers_list: {
    Question: string;
    Answer: string;
  }[];
};

export async function POST({ request }) {
  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return json({ error: "No IDs provided" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("fpr_answers")
    .select(`
      Assisted_By:filled_out_by,
      SC_ID:sc_id,
      fis_answers(
        SC_Name:sc_name
      ),
      fpr_answers_list(
        Question:form_fields!inner(
          Name:label
        ),
        Answer:answer
      )
    `)
    .in("answer_id", ids);

    console.log("Data", data);

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(data);
}
