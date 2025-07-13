// src/lib/stores/formDelta.ts
import { writable } from 'svelte/store';
import { supabase } from '$lib/db'; 

export const displayedData = writable<any>({
  form: {
    id: '',
    title: '',
    createdAt: '',
    version: 0,
    slug: '',
    sections: [
      {
        id: '',
        title: '',
        orderIndex: 0,
        formId: '',
        fields: [
          {
            id: '',
            label: '',
            name: '',
            placeholder: '',
            required: false,
            value: '',
            options: [],
            type: '',
            orderIndex: 0,
            sectionId: '',
          },
        ],
      },
    ],
  },
});

export type FieldDelta =
  | { type: string; id: string; field: Partial<{
      label: string;
      name: string;
      placeholder: string;
      sectionid:string;
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
      sectionid:string;
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
}

export type Original = {
  fields: FieldDelta[];
  sections: SectionDelta[];
}

export const formDelta = writable<Delta>({
  fields: [],
  sections: [],
});

export const originalData = writable<Original>({
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
export async function handleSectionChanges(updatedSection: any, changeType: string, formId:string) {
  console.log('formid: ', formId);
  console.log('section to be updated: ', updatedSection);
    if (changeType == 'add'){
      updatedSection.orderindex = await getNextOrderIndex(formId);
    }

    if (changeType == 'add'){
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

          // for making UI reactive
          displayedData.update(data => {
            if (data?.form) {
              try{
                data.form.sections.push({
                  id: '',
                  title: updatedSection.title,
                  orderIndex: updatedSection.orderindex,
                  formId: formId,
                  fields: []
                });
                console.log('Successfully added section:', updatedSection);
              } catch(error){
                console.error('Failed to add new section', error);
              }

            }
            return data;
          });

          return delta;
      });
    }
    
    
    else{
      formDelta.update(delta => {
          delta.sections.push({
              type: changeType,
              id: updatedSection.id,
              section: {
                  title: updatedSection.title,
                  formid: formId,
                  orderindex: updatedSection.orderindex,
              }
          });

          // for making UI reactive
          if(changeType=='delete')
            displayedData.update(data => {
              if (data?.form) {
                try{
                  data.form.sections = data.form.sections.filter((section:any) => section.id !== updatedSection.id);
                  console.log('Successfully deleted section:', updatedSection);
                } catch(error){
                  console.error('Failed to delete', error);
                }

              }
              return data;
            });

          else if(changeType == 'update'){
            console.log(updatedSection);
            displayedData.update(data => {
              if(data?.form){
                try{
                  for (let sIdx = 0; sIdx < data.form.sections.length; sIdx++){
                    if(data.form.sections[sIdx].id == updatedSection.id){
                      data.form.sections[sIdx].title = updatedSection.title;
                      break;
                    }
                  }
                }catch(error){
                  console.error('Failed to edit section', error);
                }
              }
              return data;
            });
          }
          return delta;
      });
    }

}

