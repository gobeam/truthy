import { plainToClass } from 'class-transformer';
import { DeepPartial, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ModelSerializer } from '../serializer/model.serializer';

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
   * get all entity with filters
   * @param keywords
   */
  async getAll(keywords: DeepPartial<T>): Promise<K[]> {
    const alias = keywords.constructor.name;
    const query = this.createQueryBuilder(alias);
    for (const key in keywords) {
      if (keywords.hasOwnProperty(key) && keywords[key]) {
        query.where(`${alias}.${key} LIKE :${key}`, {
          [key]: `%${keywords[key]}%`
        });
      }
    }
    return this.transformMany(await query.getMany());
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
