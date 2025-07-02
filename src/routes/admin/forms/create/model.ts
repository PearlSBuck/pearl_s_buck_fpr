export interface IForms {
  id: string;
  title: string;
  dateCreated: Date | string;
  version: string;
}

export interface IFormSections {
  id: string;
  formId: string;
  title: string;
  orderIndex: number;
}

export interface Options {
  label?: string;
  value?: string;
}

export interface IFormFields {
  id: string;
  formid: string;
  sectionid: string;
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  value: string;
  options?: Options[];
  type: string;
  orderindex: number;
}
