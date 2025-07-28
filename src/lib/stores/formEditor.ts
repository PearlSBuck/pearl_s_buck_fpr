// src/lib/stores/formDelta.ts
import { writable } from 'svelte/store';
import { supabaseAdmin } from '$lib/db'; 
import { get } from 'svelte/store';

export const notification = writable<{ message: string; type: 'success' | 'error' | null }>({
  message: '',
  type: null
});

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
  const { data, error } = await supabaseAdmin
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
                      data.form.sections[sIdx].orderIndex = updatedSection.orderindex;
                      break;
                    }
                  }
                }catch(error){
                  console.error('Failed to edit section', error);
                }
              }
              data.form.sections = [...data.form.sections].sort((a, b) => a.orderIndex - b.orderIndex);
              console.log(data.form.sections);

              return data;
            });
          }
          return delta;
      });
    }

}

    // Implements edits to the supabaseAdmin database
    export async function handleConfirmEdits(formId: string) {
        const { fields, sections } = get(formDelta); // get current delta

        console.log('Changes to apply:', fields, sections);

        try {
            // Apply field updates
            for (const fieldChange of fields) {
                const { type, id, field } = fieldChange;

                if (type === 'update') {
                    await supabaseAdmin
                        .from('form_fields')
                        .update({
                            label: field.label,
                            name: field.name,
                            placeholder: field.placeholder,
                            required: field.required,
                            type: field.type,
                            orderindex: field.orderindex,
                            options: field.options
                        })
                        .eq('id', id);
                } else if (type === 'add') {
                    await supabaseAdmin
                        .from('form_fields')
                        .insert({
                            label: field.label,
                            name: field.name,
                            placeholder: field.placeholder,
                            required: false,
                            formid: formId,
                            sectionid: field.sectionid,
                            type: field.type,
                            orderindex: 0,
                            options: field.options
                        });
                } else if (type === 'delete') {
                    await supabaseAdmin
                        .from('form_fields')
                        .delete()
                        .eq('id', id);
                }
            }

            // Do the same for sections if needed
            for (const sectionChange of sections) {
                const { type, id, section } = sectionChange;

                if (type === 'update') {
                    await supabaseAdmin.from('form_sections').update({
                        title: section.title, 
                        orderindex: section.orderindex  
                    }).eq('id', id);
                } else if (type === 'add') {
                    await supabaseAdmin.from('form_sections').insert({
                        formid: formId,
                        title: section.title, 
                        orderindex: section.orderindex
                    });
                } else if (type === 'delete') {
                    await supabaseAdmin.from('form_sections').delete().eq('id', id);
                }
            }

            // After all updates are done, clear the store
            formDelta.set({ fields: [], sections: [] });
            console.log('All changes applied successfully.');
            return true;
            
        } catch (error) {
            console.error('Error applying changes:', error);
            return false;
        }
}
// 