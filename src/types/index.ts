export type Nullable<T> = T | null;

export type WithId<T> = T & { id: string };

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};
