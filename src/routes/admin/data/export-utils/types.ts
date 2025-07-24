export interface FormField {
    id: string;
    label: string;
    type: string;
    sectionid: string;
}

export interface Answer {
    answer: string;
    question_id: string;
    form_fields: FormField | FormField[]; // Allow either single object or array
}

export interface Section {
    id: string;
    title: string;
    orderindex: number;
}

export interface SectionWithFields extends Section {
    fields: Array<{
        label: string;
        answer: string;
    }>;
}

export interface Record {
    sc_id: string | number;
    sc_name: string;
    answer_id: string;
    form_id: string;
    created_at: string;
    forms?: {
        id: string;
        title: string;
        version: string;
    };
}

export interface ExportRequestBody {
    ids: (string | number)[];
    format: 'csv' | 'xlsx' | 'pdf';
}