import type { PageServerLoad } from "./$types";
import { getPaginatedSCRecords } from "./recordQuery";

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get("page") || "1");
  const query = url.searchParams.get("q") || "";

  const { records, totalPages, currentPage } = await getPaginatedSCRecords(
    page,
    query
  );

  console.log(records);

  return {
    records,
    totalPages,
    currentPage,
    query,
  };
};
