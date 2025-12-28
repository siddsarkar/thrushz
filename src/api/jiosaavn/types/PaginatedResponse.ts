export interface JiosaavnPaginatedResponse<T> {
  total: number;
  start: number;
  results: T[];
}
