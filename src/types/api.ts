export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type SortOrder = "asc" | "desc";

export type PaginationParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

export type SearchParams = PaginationParams & {
  query?: string;
};
