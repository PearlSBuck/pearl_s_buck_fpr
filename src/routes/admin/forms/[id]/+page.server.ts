// +page.server.js - Updated to remove repeatable section references
import { supabase } from "$lib/db";
import { fail, error } from '@sveltejs/kit';

// Helper function to create URL-safe slug from form name
interface CreateSlug {
    (name: string): string;
}

const createSlug: CreateSlug = function(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// Helper function to parse form name and version from slug
interface ParsedFormSlug {
    nameSlug: string;
    version: number;
}

// Fixed parseFormSlug function - normalize case to match createSlug behavior
function parseFormSlug(slug: string): ParsedFormSlug {
    // Handle URL-encoded spaces and normalize
    const normalizedSlug = decodeURIComponent(slug).trim();
    
    // Try multiple version patterns
    const patterns = [
        /^(.+?)-v(\d+(?:\.\d+)?)$/,     // name-v1.0
        /^(.+?)-(\d+(?:\.\d+)?)$/,      // name-1.0
        /^(.+?)\+v?(\d+(?:\.\d+)?)$/    // name+1.0 or name+v1.0
    ];
    
    for (const pattern of patterns) {
        const match = normalizedSlug.match(pattern);
        if (match) {
            const [, nameSlug, version] = match;
            return {
                nameSlug: createSlug(nameSlug), // Apply createSlug to normalize case
                version: parseFloat(version)
            };
        }
    }
    
    // If no version pattern found, check if it's just a raw form title
    // Create slug from the input and assume version 1.0
    return {
        nameSlug: createSlug(normalizedSlug), // Apply createSlug to normalize case
        version: 1.0
    };
}

export async function load({ params, url }) {
    const formSlug = params.id || url.searchParams.get('id') || url.searchParams.get('formSlug');
    
    console.log('Loading form with slug:', formSlug);
    
    if (!formSlug) {
        throw error(404, {
            message: 'Form identifier is required. Please provide a valid form name and version in the URL.'
        });
    }

    try {
        let formBasic;
        
        // Parse the slug to extract name and version
        const { nameSlug, version } = parseFormSlug(formSlug);
        console.log('Parsed slug:', { nameSlug, version, originalSlug: formSlug });

        // ONLY STRATEGY: Find form by matching EXACT title slug and version
        const { data: allForms, error: allFormsError } = await supabase
            .from('forms')
            .select('id, title, createdat, version');

        if (allFormsError) {
            console.error('Error fetching all forms:', allFormsError);
            throw error(500, 'Failed to fetch forms from database');
        }

        if (allForms && allForms.length > 0) {
            console.log('Available forms:', allForms.map(f => ({ 
                title: f.title, 
                version: f.version, 
                slug: createSlug(f.title) 
            })));
            
            // Find form by matching EXACT slug and EXACT version - NO FALLBACKS
            formBasic = allForms.find(form => {
                const formSlug = createSlug(form.title);
                const versionMatch = Math.abs(form.version - version) < 0.001; // Handle floating point precision
                console.log(`Comparing: "${formSlug}" === "${nameSlug}" && ${form.version} === ${version} (${versionMatch})`);
                return formSlug === nameSlug && versionMatch;
            });
        }

        // If no exact match found, throw 404 - NO FALLBACK STRATEGIES
        if (!formBasic) {
            console.error('Form not found with exact name and version match.');
            console.error('Required - nameSlug:', nameSlug, 'version:', version);
            console.error('Available forms:', allForms?.map(f => ({
                nameSlug: createSlug(f.title),
                version: f.version
            })));
            
            throw error(404, {
                message: `Form "${nameSlug}" version ${version} not found. Please check the form name and version number in the URL.`
            });
        }

        console.log('Found exact match:', formBasic);

        // Fetch sections for this form - REMOVED repeatable, section_type, max_instances
        const { data: sectionsData, error: sectionsError } = await supabase
            .from('form_sections')
            .select('id, title, orderindex, formid')
            .eq('formid', formBasic.id)
            .order('orderindex', { ascending: true });

        if (sectionsError) {
            console.error('Error fetching sections:', sectionsError);
            throw error(500, 'Failed to fetch form sections');
        }

        console.log(`Found ${sectionsData?.length || 0} sections for form ${formBasic.id}`);
        
        // Debug: Let's see what sections exist and their formid values
        const { data: allSections, error: allSectionsError } = await supabase
            .from('form_sections')
            .select('id, title, formid');
            
        if (!allSectionsError && allSections) {
            console.log('All sections in database:', allSections.map(s => ({
                id: s.id,
                title: s.title,
                formid: s.formid,
                formidType: typeof s.formid,
                matches: s.formid === formBasic.id
            })));
            console.log('Looking for formid:', formBasic.id, 'type:', typeof formBasic.id);
        }

        // Fetch all fields for all sections in one query for better performance
        const sectionIds = sectionsData?.map(section => section.id) || [];

        interface FormField {
            id: string;
            label: string;
            name: string;
            placeholder?: string;
            required?: boolean;
            options?: any[];
            type: string;
            orderindex: number;
            sectionid: string;
        }
        
        let allFields: FormField[] = [];
        
        if (sectionIds.length > 0) {
            const { data: fieldsData, error: fieldsError } = await supabase
                .from('form_fields')
                .select('id, label, name, placeholder, required, options, type, orderindex, sectionid')
                .in('sectionid', sectionIds)
                .order('sectionid', { ascending: true })
                .order('orderindex', { ascending: true });

            if (fieldsError) {
                console.error('Error fetching fields:', fieldsError);
                throw error(500, 'Failed to fetch form fields');
            }

            allFields = fieldsData || [];
            console.log(`Found ${allFields.length} total fields`);
        }

        // Group fields by section
        const fieldsBySection: Record<string, FormField[]> = {};
        allFields.forEach(field => {
            if (!fieldsBySection[field.sectionid]) {
                fieldsBySection[field.sectionid] = [];
            }
            fieldsBySection[field.sectionid].push(field);
        });

        // Build the complete form structure - REMOVED repeatable functionality
        const mappedForm = {
            id: formBasic.id,
            title: formBasic.title,
            createdAt: formBasic.createdat,
            version: formBasic.version,
            slug: `${createSlug(formBasic.title)}-${formBasic.version}`,
            sections: (sectionsData || []).map(section => ({
                id: section.id,
                title: section.title,
                orderIndex: section.orderindex,
                formId: section.formid,
                fields: (fieldsBySection[section.id] || []).map(field => ({
                    id: field.id,
                    label: field.label,
                    name: field.name,
                    placeholder: field.placeholder || '',
                    required: field.required || false,
                    value: '', // Default empty value since it's not stored in form_fields table
                    options: field.options || [],
                    type: field.type,
                    orderIndex: field.orderindex,
                    sectionId: field.sectionid
                }))
            }))
        };

        console.log('Final form structure:', {
            id: mappedForm.id,
            title: mappedForm.title,
            version: mappedForm.version,
            slug: mappedForm.slug,
            sectionsCount: mappedForm.sections.length,
            totalFields: mappedForm.sections.reduce((acc, section) => acc + section.fields.length, 0)
        });

        return {
            form: mappedForm,
            useNewTables: true // Always use new table structure
        };

    } catch (err) {
        console.error('Server error:', err);
        if (typeof err === 'object' && err !== null && 'status' in err) {
            throw err;
        }
        throw error(500, 'Internal server error while loading form');
    }
}

export const actions = {
    updateField: async ({ request }) => {
        const data = await request.formData();
        const fieldId = data.get('fieldId');
        const value = data.get('value');

        if (!fieldId) {
            return fail(400, { message: 'Field ID is required' });
        }

        try {
            // NOTE: If field values are stored in a separate table (like form_responses), 
            // you'll need to update this logic accordingly
            const { error: updateError } = await supabase
                .from('form_fields')
                .update({ /* Add the correct column for storing field values */ })
                .eq('id', fieldId);

            if (updateError) {
                console.error('Update field error:', updateError);
                return fail(500, { message: 'Failed to update field: ' + updateError.message });
            }

            return { success: true };
        } catch (err) {
            console.error('Action error:', err);
            return fail(500, { message: 'Internal server error' });
        }
    },

    updateForm: async ({ request }) => {
        const data = await request.formData();
        const formId = data.get('formId');
        const title = data.get('title');
        const version = data.get('version');

        if (!formId || !title) {
            return fail(400, { message: 'Form ID and title are required' });
        }

        try {
            const updateData: any = { title: title.toString() };
            if (version) {
                updateData.version = parseFloat(version.toString());
            }

            const { error: updateError } = await supabase
                .from('forms')
                .update(updateData)
                .eq('id', formId);

            if (updateError) {
                console.error('Update form error:', updateError);
                return fail(500, { message: 'Failed to update form: ' + updateError.message });
            }

            return { success: true };
        } catch (err) {
            console.error('Action error:', err);
            return fail(500, { message: 'Internal server error' });
        }
    },

    saveAllFields: async ({ request }) => {
        const data = await request.formData();
        const formId = data.get('formId');
        
        try {
            const fieldUpdates = [];
            
            // Parse all field values from form data
            for (const [key, value] of data.entries()) {
                if (key.startsWith('field_')) {
                    const fieldId = key.replace('field_', '');
                    fieldUpdates.push({ id: fieldId, value: value || '' });
                } else if (key.endsWith('_other')) {
                    // Handle "others" text fields for radio_with_other
                    fieldUpdates.push({
                        fieldKey: key,
                        value: value || '',
                        isOtherText: true
                    });
                }
            }

            console.log(`Processing ${fieldUpdates.length} field updates for form ${formId}`);

            // For now, we'll just log the data that would be saved
            console.log('Field updates to be saved:', fieldUpdates.slice(0, 5)); // Log first 5 for brevity

            return { 
                success: true, 
                message: `Successfully processed ${fieldUpdates.length} field updates`,
                fieldCount: fieldUpdates.length
            };
        } catch (err) {
            console.error('Save all fields error:', err);
            return fail(500, { message: 'Internal server error: ' + (err instanceof Error ? err.message : 'Unknown error') });
        }
    },

    createNewVersion: async ({ request }) => {
        const data = await request.formData();
        const formId = data.get('formId');
        const newVersion = data.get('newVersion');

        if (!formId || !newVersion) {
            return fail(400, { message: 'Form ID and new version are required' });
        }

        try {
            const { error: updateError } = await supabase
                .from('forms')
                .update({ version: parseFloat(newVersion.toString()) })
                .eq('id', formId);

            if (updateError) {
                console.error('Create new version error:', updateError);
                return fail(500, { message: 'Failed to create new version: ' + updateError.message });
            }

            return { success: true };
        } catch (err) {
            console.error('Action error:', err);
            return fail(500, { message: 'Internal server error' });
        }
    }
};