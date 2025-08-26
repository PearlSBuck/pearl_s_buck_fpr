import { supabaseAdmin } from "$lib/db";
import type { Record } from './types';

/**
 * Fetch FIS records by IDs
 */
export async function fetchFISRecords(ids: (string | number)[]) {
    const { data, error } = await supabaseAdmin
        .from("fis_answers")
        .select(`
        *,
        children:child_id (
            child_id,
            child_name
        ),
        forms:form_id (
            id,
            title,
            version
        )
        `)
        .in("child_id", ids);

    if (error) {
        throw new Error(error.message);
    }
    
    return data as Record[];
}

/**
 * Fetch FPR records by IDs
 */
export async function fetchFPRRecords(ids: (string | number)[]) {
    const { data, error } = await supabaseAdmin
        .from("fpr_answers")
        .select(`
        *,
        forms:form_id (
            id,
            title,
            version
        )
        `)
        .in("sc_id", ids);

    if (error) {
        throw new Error(error.message);
    }
    
    return data as Record[];
}

/**
 * Fetch answers for a specific FIS record
 */
export async function fetchFISAnswers(answerId: string) {
    const { data, error } = await supabaseAdmin
        .from("fis_answers_list")
        .select(`
        answer,
        question_id,
        form_fields:question_id (
            id,
            label,
            type,
            sectionid
        )
        `)
        .eq("answer_id", answerId);

    if (error) {
        throw new Error(error.message);
    }
    
    return data;
}

/**
 * Fetch answers for a specific FPR record
 */
export async function fetchFPRAnswers(answerId: string) {
    const { data, error } = await supabaseAdmin
        .from("fpr_answers_list")
        .select(`
        answer,
        question_id,
        form_fields:question_id (
            id,
            label,
            type,
            sectionid
        )
        `)
        .eq("answer_id", answerId);

    if (error) {
        throw new Error(error.message);
    }
    
    return data;
}

/**
 * Fetch form sections for a specific form
 */
export async function fetchFormSections(formId: string) {
    const { data, error } = await supabaseAdmin
        .from("form_sections")
        .select(`
        id,
        title,
        orderindex
        `)
        .eq("formid", formId)
        .order("orderindex", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }
    
    return data;
}