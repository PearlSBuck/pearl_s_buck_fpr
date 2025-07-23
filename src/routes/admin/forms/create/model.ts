export interface IForms {
  title: string;
  dateCreated: Date | string;
  version: string;
}

export interface IFormSections {
  title: string;
  orderIndex: number;
}

export interface Options {
  label?: string;
  value?: string;
}

export interface IFormFields {
  label: string;
  name: string;
  placeholder?: string;
  required: boolean;
  value: string;
  options?: Options[];
  type: string;
  orderindex: number;
}
