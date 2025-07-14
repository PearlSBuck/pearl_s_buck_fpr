import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getFPRRecord, getFPRAnswers, getFormStructure } from '../../../recordQuery';

export const load = (async ({ params }: { params: { id: string, answerId: string } }) => {
    const childId = parseInt(params.id);
    const answerId = params.answerId;
    
    if (!childId || !answerId) {
        throw error(404, 'Missing parameters');
    }

    // Get the main FPR record
    const record = await getFPRRecord(answerId);

    // Get all answers for this record
    const answers = await getFPRAnswers(answerId);

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
        title: `FPR Record: ${record.sc_name} (${new Date(record.created_at).getFullYear()})`
    };
}) satisfies PageServerLoad;