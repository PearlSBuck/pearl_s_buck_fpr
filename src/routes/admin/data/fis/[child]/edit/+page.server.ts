import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getFISRecord, getFISAnswers, getFormStructure } from '../../../recordQuery';

export const load: PageServerLoad = async ({ params }) => {
    const childId = parseInt(params.child);
    
    if (!childId || isNaN(childId)) {
        throw redirect(303, '/admin/data');
    }

    try {
        // Get the main FIS record
        const record = await getFISRecord(childId);
        
        if (!record) {
            throw error(404, `No record found for child ID ${childId}`);
        }

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
            title: `Edit FIS Record: ${record.sc_name}`
        };
    } catch (err: any) {
        console.error('Error loading FIS record for editing:', err);
        
        if (err.code === 'PGRST116') {
            throw error(404, `No record found for child ID ${childId}`);
        }
        
        throw error(500, err.message || 'An error occurred while loading the record');
    }
};