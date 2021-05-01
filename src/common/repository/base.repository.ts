import { plainToClass } from 'class-transformer';
import { DeepPartial, ILike, Not, ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ModelSerializer } from '../serializer/model.serializer';
import { Pagination } from '../../paginate';

/**
 * Base Repository for code reuse
 */
export class BaseRepository<
  T,
  K extends ModelSerializer
> extends Repository<T> {
  /***
   * get entity by id
   * @param id
   * @param relations
   * @param transformOptions
   */
  async get(
    id: number,
    relations: string[] = [],
    transformOptions = {}
  ): Promise<K | null> {
    return await this.findOne({
      where: { id },
      relations
    })
      .then((entity) => {
        if (!entity) {
          return Promise.reject(new NotFoundException());
        }
        return Promise.resolve(
          entity ? this.transform(entity, transformOptions) : null
        );
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * find by condition
   * @param fieldName
   * @param value
   * @param relations
   * @param transformOptions
   */
  async findBy(
    fieldName: string,
    value: any,
    relations: string[] = [],
    transformOptions = {}
  ): Promise<K | null> {
    return await this.findOne({
      where: { [fieldName]: value },
      relations
    })
      .then((entity) => {
        if (!entity) {
          return Promise.reject(new NotFoundException());
        }
        return Promise.resolve(
          entity ? this.transform(entity, transformOptions) : null
        );
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * get count of entity by condition
   * @param conditions
   * @param id
   */
  async countEntityByCondition(
    conditions: ObjectLiteral,
    id: number
  ): Promise<number> {
    let filteredCondition: ObjectLiteral = {};
    if (id > 0) {
      filteredCondition.id = Not(id);
    }
    filteredCondition = { ...conditions, ...filteredCondition };
    return this.count({
      where: filteredCondition
    })
      .then((count) => {
        return Promise.resolve(count);
      })
      .catch((error) => Promise.reject(error));
  }

  /**
   * get all entity with filters
   * @param keywords
   */
  async getAll(keywords: DeepPartial<T>, transformOptions = {}): Promise<K[]> {
    const alias = keywords.constructor.name;
    const query = this.createQueryBuilder(alias);
    for (const key in keywords) {
      if (keywords.hasOwnProperty(key) && keywords[key]) {
        query.where(`${alias}.${key} LIKE :${key}`, {
          [key]: `%${keywords[key]}%`
        });
      }
    }
    return this.transformMany(await query.getMany(), transformOptions);
  }

  /**
   * get paginated result
   * @param keywords
   * @param options
   * @param transformOptions
   */
  async paginate(
    keywords: DeepPartial<T>,
    options,
    transformOptions = {}
  ): Promise<Pagination<K>> {
    const whereCondition = [];
    const ignoreKeys = ['page', 'limit'];
    for (const key in keywords) {
      if (
        keywords.hasOwnProperty(key) &&
        keywords[key] &&
        !ignoreKeys.includes(key)
      ) {
        whereCondition.push({
          [key]: ILike(`%${keywords[key]} #%`)
        });
      }
    }
    const page =
      typeof options.page !== 'undefined' && options.page > 0
        ? options.page
        : 1;
    // const limit =
    //   typeof options.limit !== 'undefined' && options.limit > 0
    //     ? options.limit
    //     : 10;
    const limit = 5;
    const skip = (page - 1) * limit;
    const [results, total] = await this.findAndCount({
      where: whereCondition,
      take: limit,
      skip
    });
    const serializedResult = this.transformMany(results, transformOptions);
    return new Pagination<K>({
      results: serializedResult,
      totalItems: total,
      pageSize: limit,
      currentPage: page,
      previous: page > 1 ? page - 1 : 0,
      next: total > skip + limit ? page + 1 : 0
    });
  }

  /**
   * create new entity
   * @param inputs
   * @param relations
   */
  async createEntity(
    inputs: DeepPartial<T>,
    relations: string[] = []
  ): Promise<K> {
    return this.save(inputs)
      .then(async (entity) => await this.get((entity as any).id, relations))
      .catch((error) => Promise.reject(error));
  }

  /**
   * update existing entity by id
   * @param entity
   * @param inputs
   * @param relations
   */
  async updateEntity(
    entity: K,
    inputs: QueryDeepPartialEntity<T>,
    relations: string[] = []
  ): Promise<K> {
    return this.update(entity.id, inputs)
      .then(async () => await this.get(entity.id, relations))
      .catch((error) => Promise.reject(error));
  }

  /**
   * transform entity
   * @param model
   * @param transformOptions
   */
  transform(model: T, transformOptions = {}): K {
    return plainToClass(ModelSerializer, model, transformOptions) as K;
  }

  /**
   * transform array of entity
   * @param models
   * @param transformOptions
   */
  transformMany(models: T[], transformOptions = {}): K[] {
    return models.map((model) => this.transform(model, transformOptions));
  }
}
