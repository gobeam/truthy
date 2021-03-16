import { CommonDtoInterface } from './common-dto.interface';

/**
 * common service interface
 */
export interface CommonServiceInterface<T> {
  store(filter: CommonDtoInterface): Promise<T>;
  findOne(id: number): Promise<T>;
  update(id: number, inputDto: CommonDtoInterface): Promise<T>;
  remove(id: number): Promise<void>;
}
