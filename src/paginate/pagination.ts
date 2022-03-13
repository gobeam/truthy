import { PaginationResultInterface } from 'src/paginate/pagination.results.interface';
export class Pagination<PaginationEntity> {
  public results: PaginationEntity[];
  public currentPage: number;
  public pageSize: number;
  public totalItems: number;
  public next: number;
  public previous: number;

  constructor(paginationResults: PaginationResultInterface<PaginationEntity>) {
    this.results = paginationResults.results;
    this.currentPage = paginationResults.currentPage;
    this.pageSize = paginationResults.pageSize;
    this.totalItems = paginationResults.totalItems;
    this.next = paginationResults.next;
    this.previous = paginationResults.previous;
  }
}
