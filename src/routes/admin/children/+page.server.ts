import type { PageServerLoad } from "./$types";
import { getPaginatedChildrenRecords } from "./childrenQuery";

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get("page") || "1");
  const query = url.searchParams.get("q") || "";

  const { records, totalPages, currentPage } = await getPaginatedChildrenRecords(
    page,
    query
  );

  return {
    records,
    totalPages,
    currentPage,
    query,
  };
};
