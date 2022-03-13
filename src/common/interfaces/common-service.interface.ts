import { CommonDtoInterface } from 'src/common/interfaces/common-dto.interface';
import { Pagination } from 'src/paginate';

/**
 * common service interface
 */
export interface CommonServiceInterface<T> {
  create(filter: CommonDtoInterface): Promise<T>;
  findAll(filter: CommonDtoInterface): Promise<Pagination<T>>;
  findOne(id: number): Promise<T>;
  update(id: number, inputDto: CommonDtoInterface): Promise<T>;
  remove(id: number): Promise<void>;
}
