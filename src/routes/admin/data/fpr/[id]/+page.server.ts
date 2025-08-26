// This file runs on the server side before rendering the page

import { error, redirect } from '@sveltejs/kit';
import { supabaseAdmin } from "$lib/db";
import type { PageServerLoad } from "./$types";
import { getFPRRecordsByChildId } from "../../recordQuery";

export const load: PageServerLoad = async ({ params, url }) => {
  const id = Number(params.id); // Get `id` from the URL param
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = 10;

  if (!id || isNaN(id)) {
    throw redirect(303, '/admin/data');
  }

  try {
    // Get all FPR records for this child
    const fprData = await getFPRRecordsByChildId(id);
    
    // If no records were found, check if the child exists at all
    if (fprData.length === 0) {
      // Check if child exists in fis_answers
      const { data, error: childCheckError } = await supabaseAdmin
        .from("fis_answers")
        .select("child_id")
        .eq("child_id", id)
        .limit(1);
        
      if (childCheckError || !data || data.length === 0) {
        throw error(404, `No child found with ID ${id}`);
      }
      
      // Child exists but has no FPR records
      const childName: string = await getChildName(id);
      
      return {
        childId: id,
        childName: childName,
        years: [],
        recordsByYear: {},
        totalPages: 0,
        currentPage: 1,
        totalRecords: 0
      };
    }

    // Group records by year for easier display
    interface RecordsByYear {
      [year: number]: Array<typeof fprData[number]>;
    }

    const recordsByYear = fprData.reduce((acc, record) => {
      const year = new Date(record.created_at).getFullYear();
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(record);
      return acc;
    }, {} as RecordsByYear);


    // Sort years in descending order (newest first)
    const years = Object.keys(recordsByYear)
      .map(Number)
      .sort((a, b) => b - a);
    
    // Get child name from the first record if available
    const childName = await getChildName(id);

    // Calculate pagination
    const totalPages = Math.ceil(years.length / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedYears = years.slice(startIdx, endIdx);

    return {
      childId: id,
      childName: childName,
      years: paginatedYears,
      recordsByYear,
      totalPages,
      currentPage,
      totalRecords: fprData.length
    };
  } catch (err: any) {
    console.error('Error loading FPR records:', err);
    
    // Check for specific error codes
    if (err.status === 404 || err.code === 'PGRST116') {
      throw error(404, `No child found with ID ${id}`);
    }
    
    // For any other error
    throw error(500, 'Error loading progress reports');
  }

  // Helper function to get child name
  async function getChildName(id: number) {
    // First check FIS records for the child's name
    const { data: childRecord } = await supabaseAdmin
      .from("children")
      .select("child_name")
      .eq("child_id", id)
      .single();
      
    if (childRecord?.child_name) {
      return childRecord.child_name;
    }
  }
};
