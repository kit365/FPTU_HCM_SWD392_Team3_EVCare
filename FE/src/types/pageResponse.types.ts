export interface PageResponse<T> {
  data?: T[];  // BE trả về "data" chứa array
  content?: T[];  // Keep for backward compatibility
  page?: number;  // BE trả về "page"
  number?: number;  // Keep for backward compatibility
  size?: number;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;  // BE trả về "last"
}