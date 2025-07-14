// This file runs on the server side before rendering the page

import { supabaseAdmin } from "$lib/db";
import type { PageServerLoad } from "./$types";
import { getFPRRecordsByChildId } from "../../recordQuery";

export const load: PageServerLoad = async ({ params, url }) => {
  const id = Number(params.id); // Get `id` from the URL param
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get all FPR records for this child
  const fprData = await getFPRRecordsByChildId(id);

  // Group records by year for easier display
  interface RecordsByYear {
    [year: number]: Array<typeof fprData[number]>;
  }

    // Group records by year for easier display
  const recordsByYear = fprData.reduce<RecordsByYear>((acc, record) => {
    const year = new Date(record.created_at).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(record);
    return acc;
  }, {});

  // Sort years in descending order (newest first)
  const years = Object.keys(recordsByYear)
    .map(Number)
    .sort((a, b) => b - a);
  
  // Get child name from the first record if available
  const childName = fprData.length > 0 ? 
    await getChildName(id) : 
    "Unknown Child";

  // Calculate pagination
  const totalPages = Math.ceil(years.length / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedYears = years.slice(startIdx, endIdx);

    return {
      childId: id,
      childName,
      years: paginatedYears,
      recordsByYear,
      totalPages,
      currentPage,
      totalRecords: fprData.length
    };

  // Helper function to get child name
  async function getChildName(id: number) {
    // Get the child's name from any record
    const { data } = await supabaseAdmin
      .from("fpr_answers")
      .select("sc_name")
      .eq("sc_id", id)
      .limit(1)
      .single();
    
    return data?.sc_name || `Child #${id}`;
  }

};
