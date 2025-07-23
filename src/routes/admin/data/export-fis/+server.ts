import { json } from "@sveltejs/kit";
import { supabaseAdmin } from "$lib/db";

type FISRow = {
  Assisted_By: string;
  SC_ID: number;
  SC_Name: string;
  fis_answers_list: {
    Question: { Name: string }[];
    Answer: string;
  }[];
};


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

    const transformed = data?.map((row: FISRow) => {
      const base = {
        SC_ID: row.SC_ID,
        SC_Name: row.SC_Name ?? "",
        Filled_out_by: row.Assisted_By,
      };

      const qas: Record<string, string> = {};
      row.fis_answers_list.forEach((item, index) => {
        qas[`Question${index + 1}`] =
          typeof item.Question === "object" && item.Question !== null
            ? item.Question.Name
            : String(item.Question);

        qas[`Answer${index + 1}`] = item.Answer ?? "";
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
