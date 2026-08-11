export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function getPagination(query: PaginationQuery): PaginationParams {
  const page = Math.max(parseInt(String(query.page ?? "1"), 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(String(query.limit ?? "10"), 10) || 10, 1),
    100
  );
  return { page, limit, skip: (page - 1) * limit, take: limit };
}
