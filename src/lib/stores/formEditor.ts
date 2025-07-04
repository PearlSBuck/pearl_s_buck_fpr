// src/lib/stores/formDelta.ts
import { writable } from 'svelte/store';

export type FieldDelta =
  | { type: string; id: string; field: Partial<{
      label: string;
      name: string;
      placeholder: string;
      required: boolean;
      type: string;
      orderindex: number;
      options: { label: string; value: string }[];
    }> }
export type SectionDelta =
  | { type: string; id: string;section: Partial<{ 
    id: string;
    title: string; 
    formid: string;
    orderIndex: number 
    created_at: any;
    }> }

export type Delta = {
  fields: FieldDelta[];
  sections: SectionDelta[];
};

export const formDelta = writable<Delta>({
  fields: [],
  sections: [],
});
