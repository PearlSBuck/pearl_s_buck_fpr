export interface IForms {
    id: number;
    title: string;
    dateCreated: Date | string;
}

export interface IFormSections {
    id: number;
    formId: number;
    title: string;
    orderIndex: number;
}

export interface Options {
    label?: string;
    value?: string;
}

export interface IFormFields {
    id: number;
    formId: number;
    sectionId: number;
    label: string;
    name: string;
    placeholder?: string;
    required: boolean;
    value: string;
    options?: Options[];
    type: string;
}