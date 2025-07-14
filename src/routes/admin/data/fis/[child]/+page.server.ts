import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getFISRecord, getFISAnswers, getFormStructure } from '../../recordQuery';
import { supabase } from '$lib/db';

export const load = (async ({ params }) => {
    const childId = parseInt(params.child);
    
    if (!childId) {
        throw error(404, 'Child ID not provided');
    }

    // Get the main FIS record
    const record = await getFISRecord(childId);

    // Get all answers for this record
    const answers = await getFISAnswers(record.answer_id);

    // Get the form structure
    const formStructure = await getFormStructure(record.form_id);
    
    // Organize answers by section for easier rendering
    const organizedData = formStructure.map(section => {
        return {
        ...section,
        fields: section.form_fields.map(field => {
            // Find the answer for this field
            const answer = answers.find(a => a.question_id === field.id);
            return {
            ...field,
            answer: answer ? answer.answer : null
            };
        })
        };
    });
    
    return {
        record,
        organizedData,
        title: `FIS Record: ${record.sc_name}`
    };
}) satisfies PageServerLoad;