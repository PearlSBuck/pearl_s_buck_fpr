import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getFPRRecord, getFPRAnswers, getFormStructure } from '../../../../recordQuery';

export const load: PageServerLoad = async ({ params }) => {
    const childId = parseInt(params.id);
    const answerId = params.answerId;
    
    if (!childId || isNaN(childId) || !answerId) {
        throw redirect(303, '/admin/data');
    }

    try {
        // Get the main FPR record
        const record = await getFPRRecord(answerId);
        
        if (!record) {
            throw error(404, `No record found with ID ${answerId}`);
        }
        
        // Check that the record belongs to the specified child
        if (record.sc_id !== childId) {
            throw error(403, `This record doesn't belong to the specified child`);
        }

        // Get all answers for this record
        const answers = await getFPRAnswers(answerId);

        // Get the form structure
        const formStructure = await getFormStructure(record.form_id);
        
        // Organize answers by section for easier editing
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
            title: `Edit FPR Record: ${record.sc_name} (${new Date(record.created_at).getFullYear()})`
        };
    } catch (err: any) {
        console.error('Error loading FPR record for editing:', err);
        
        if (err.code === 'PGRST116') {
            throw error(404, `No record found with ID ${answerId}`);
        }
        
        throw error(500, err.message || 'An error occurred while loading the record');
    }
};