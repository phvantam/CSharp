// ============================================================
// COMMON / SHARED TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  errors?: string[];
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  label: string;
  value: string | number;
}
