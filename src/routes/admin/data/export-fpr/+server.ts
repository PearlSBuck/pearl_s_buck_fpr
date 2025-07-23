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

    const transformed = data?.map((row) => {
      const base = {
        SC_ID: row.SC_ID,
        SC_Name: Array.isArray(row.fis_answers) && row.fis_answers.length > 0
          ? row.fis_answers[0].SC_Name
          : "",
        Filled_out_by: row.Assisted_By,
      };

      const qas: Record<string, string> = {};
      row.fpr_answers_list.forEach((item, index) => {
        qas[`Question${index + 1}`] = Array.isArray(item.Question)
          ? item.Question.map((q: { Name: string }) => q.Name).join(", ")
          : item.Question;
        qas[`Answer${index + 1}`] = item.Answer;
      });

      return {
        ...base,
        ...qas,
      };
  });

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  return json(transformed);
}
