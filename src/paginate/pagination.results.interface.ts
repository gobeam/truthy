export interface PaginationResultInterface<PaginationEntity> {
  results: PaginationEntity[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  next: number;
  previous: number;
}
