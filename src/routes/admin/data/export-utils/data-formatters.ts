import type { Record as RecordType, Section, Answer } from './types';

/**
 * Organizes answers by section for structured export
 */
export function organizeAnswersBySection(record: RecordType, sections: Section[], answers: Answer[]) {
    return sections.map(section => {
        return {
            ...section,
            fields: answers
                .filter(a => {
                    // Get the form_fields object and check sectionid
                    const formFields = Array.isArray(a.form_fields) 
                        ? a.form_fields[0] 
                        : a.form_fields;
                    return formFields?.sectionid === section.id;
                })
                .map(a => {
                    // Get the form_fields object and extract label
                    const formFields = Array.isArray(a.form_fields) 
                        ? a.form_fields[0] 
                        : a.form_fields;
                    return {
                        label: formFields?.label || 'Unknown Field',
                        answer: a.answer || 'Not provided'
                    };
                })
        };
    });
}

/**
 * Clean record data for CSV/XLSX export by flattening nested properties
 */
export function cleanRecordData(data: any[]) {
    return data.map(entry => {
        const newEntry: {[key: string]: any} = {};
        
        for (const key in entry) {
        if (!Object.prototype.hasOwnProperty.call(entry, key)) continue;
        const value = entry[key];
        
        // If value is object and has Name property
        if (typeof value === 'object' && value !== null && 'Name' in value) {
            newEntry[key] = value.Name;
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Handle other nested objects by flattening them with dot notation
            for (const nestedKey in value) {
            if (Object.prototype.hasOwnProperty.call(value, nestedKey)) {
                newEntry[`${key}_${nestedKey}`] = value[nestedKey];
            }
            }
        } else {
            newEntry[key] = value;
        }
        }
        
        return newEntry;
    });
}