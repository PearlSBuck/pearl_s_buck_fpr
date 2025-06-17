import { IFormFields, IForms, IFormSections } from "./model";
import pgDb from "../../lib/db";
export async function createForm(data: IForms): Promise<string> {
  const values = await pgDb.query(
    "INSERT INTO public.forms(title, createdAt) VALUES($1,$2) RETURNING id",
    [data.title, data.dateCreated]
  );
  console.log(values);
  return values.rows[0].id ?? "";
}

export async function createFormSection(
  formId: string,
  data: Omit<IFormSections, "id" | "formid">
): Promise<string> {
  const values = await pgDb.query(
    "INSERT INTO public.form_sections (title, formId, orderIndex)VALUES ($1, $2, $3) RETURNING id",
    [data.title, formId, data.orderIndex]
  );

  return values.rows[0].id ?? "";
}

export async function createFormFieldsPerSection(
  formFields: Omit<IFormFields, "id" | "sectionid" | "formid">[],
  formId: string,
  sectionId: string
) {
  const len = formFields.length;
  const placeholders = Array.from({ length: len }, (_, i) => `$${i + 1}`).join(
    ", "
  );

  const values: Omit<IFormFields, "id">[];
  formFields.forEach((obj) => {
    values.push({
      formid: formId,
      label: obj.label,
      name: obj.name,
      orderindex: obj.orderindex,
      required: obj.required,
      sectionid: sectionId,
      type: obj.type,
      value: obj.value,
      options: obj.options,
      placeholder: obj.placeholder,
    });
  });

  const value = await pgDb.query(
    `INSERT INTO FormFields (formId, sectionId, label, name, placeholder, required, value, options, type,  orderIndex) values(${placeholders})`,
    values
  );
}
