export interface PageResponse<T> {
  data: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  page: number;
  last: boolean;
}

