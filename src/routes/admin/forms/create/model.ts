/**
 * Model interfaces used for form data
 */

/**
 * Interface for Form data
 * 
 * title - Title of the form (whether it is FPR or FIS)
 * dateCreated - The date of when the form is created
 * version - Describes the version of the FPR/FIS
 */
export interface IForms {
  title: string;
  dateCreated: Date | string;
  version: string;
}

/**
 * Interface for Form Section data
 * 
 * title - Title of the section
 * orderIndex - The index of the section
 */
export interface IFormSections {
  title: string;
  orderIndex: number;
}

/**
 * Interface for Option data
 * 
 * label - Label of the option
 * value - Value of the option
 */
export interface Options {
  label?: string;
  value?: string;
}

/**
 * Interface for Form Field data
 * 
 * label - Label of the field
 * name - Name of the field attribute
 * placeholder: Placeholder text for the field
 * required: Indicates whether or not a field needs required input
 * value: Value of the field
 * options: Array of options for multiple choice / checkbox fields
 * type: The type of question, selected from different options
 * orderindex: The index of the field
 */
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
