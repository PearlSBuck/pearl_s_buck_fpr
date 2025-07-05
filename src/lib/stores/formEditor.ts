// src/lib/stores/formDelta.ts
import { writable } from 'svelte/store';
import { supabase } from '$lib/db'; 

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

export type Field = 
  | {
        label: string;
        name: string;
        placeholder: string;
        required: boolean;
        type: string;
        orderindex: number;
        options: { label: string; value: string }[];
    }
export type SectionDelta =
  | { type: string; id: string;section: Partial<{ 
    id: string;
    title: string; 
    formid: string;
    orderindex: number; 
    created_at: any;
    }> }

export type Section = 
  | {
    title: string; 
    formid: string;
    orderindex: number;
    created_at: any;
    }

export type Delta = {
  fields: FieldDelta[];
  sections: SectionDelta[];
};

export const formDelta = writable<Delta>({
  fields: [],
  sections: [],
});

async function getNextOrderIndex(formId: string) {
  const { data, error } = await supabase
    .from('form_sections')
    .select('orderindex')
    .eq('formid', formId)
    .order('orderindex', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching max orderIndex:', error);
    return null;
  }

  if(data){
    return data.orderindex + 1;
  }
  else{
    return 0;
  }
}

// for updating form sections
export async function handleSectionChanges(updatedSection: any, changeType: string, formId:any) {
  console.log(formId)
    if (!updatedSection.orderindex){
      updatedSection.orderindex = await getNextOrderIndex(formId);
    }

    if (changeType = 'add'){
        formDelta.update(delta => {
          delta.sections.push({
              type: changeType,
              id: '',
              section: {
                  title: updatedSection.title,
                  formid: formId,
                  orderindex: updatedSection.orderindex,
              }
          });
          return delta;
      });
    }
    // else{
    //   formDelta.update(delta => {
    //       delta.sections.push({
    //           type: changeType,
    //           id: updatedSection.id,
    //           section: {
    //               id: updatedSection.id,
    //               title: updatedSection.title,
    //               formid: updatedSection.formid,
    //               orderindex: updatedSection.orderindex,
    //               created_at: updatedSection.created_at
    //           }
    //       });
    //       return delta;
    //   });
    // }

}

