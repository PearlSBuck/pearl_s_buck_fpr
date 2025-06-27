import { json } from '@sveltejs/kit';
import { Pool } from "pg";
import { createForm, createFormSection, createFormFieldsPerSection } from './manage_forms.server';
import { POSTGRES_URL } from "$env/static/private";

const pgSingleton = () =>
    new Pool({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

const pgDb = new Pool({
    connectionString: POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export default pgDb;

export const POST = async ({ request }) => {
    const { form, formSections, sectionFields } = await request.json();

    // 1. Save the form and get its ID
    const formId = await createForm(form);

    // 2. For each section, save and get sectionId
    for (const section of formSections) {
        const sectionId = await createFormSection(formId, section);

        // 3. For each field in this section, save fields
        const fields = sectionFields[section.id] || [];
        if (fields.length > 0) {
            await createFormFieldsPerSection(fields, formId, sectionId);
        }
    }

    return json({ success: true });
};