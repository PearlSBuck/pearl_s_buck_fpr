import type { IFormFields, IForms, IFormSections } from "./model";
import { Pool } from "pg";
import { POSTGRES_URL } from "$env/static/private";
const pgDb = new Pool({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

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
  for (const field of formFields) {
    await pgDb.query(
      `INSERT INTO public.formfields (formId, sectionId, label, name, placeholder, required, value, options, type, orderIndex) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        formId,
        sectionId,
        field.label,
        field.name,
        field.placeholder,
        field.required,
        field.value,
        field.options ? JSON.stringify(field.options) : null,
        field.type,
        field.orderindex
      ]
    );
  }
}
