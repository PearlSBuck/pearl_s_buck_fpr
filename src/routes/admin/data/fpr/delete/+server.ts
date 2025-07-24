// filepath: c:\Users\vinie\Desktop\Kelvin Files\CSSWENG\pearl_s_buck_fpr\src\routes\admin\data\fpr\delete\+server.ts
import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/db';

export async function POST({ request }) {
    try {
        const { ids } = await request.json();
        
        if (!Array.isArray(ids) || ids.length === 0) {
        return json({ error: 'No records specified for deletion' }, { status: 400 });
        }
        
        // Delete the records from fpr_answers_list first (foreign key constraint)
        const { error: listError } = await supabaseAdmin
        .from('fpr_answers_list')
        .delete()
        .in('answer_id', ids);
        
        if (listError) {
        return json({ error: listError.message }, { status: 500 });
        }
        
        // Then delete from fpr_answers
        const { error } = await supabaseAdmin
        .from('fpr_answers')
        .delete()
        .in('answer_id', ids);
        
        if (error) {
        return json({ error: error.message }, { status: 500 });
        }
        
        return json({ success: true, deleted: ids.length });
    } catch (error) {
        return json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}