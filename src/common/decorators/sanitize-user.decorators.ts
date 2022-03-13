import { UserEntity } from 'src/auth/entity/user.entity';

/**
 * sanitize user fields
 * @param userField
 * @param strong
 * @constructor
 */
export const SanitizeUser = (userField?: string, strong = true) => {
  return (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> => {
    const decoratedFn = descriptor.value;
    async function newFunction(...args) {
      const data: any = await decoratedFn.apply(this, args);
      const user: UserEntity = userField ? data[userField] : data;
      if (user) {
        user.password = null;
        delete user.password;
        user.salt = null;
        delete user.salt;
        if (strong) {
          user.token = null;
          delete user.token;
        }
      }
      return data;
    }
    return {
      value: newFunction
    };
  };
};

/**
 * sanitize array of users
 * @param userField
 * @constructor
 */
export const SanitizeUsers = (userField?: string) => {
  return (
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ): TypedPropertyDescriptor<any> => {
    const decoratedFn = descriptor.value;

    async function newFunction(...args) {
      const entities: any[] = await decoratedFn.apply(this, args);
      return entities.map((entity) => {
        const user: UserEntity = userField ? entity[userField] : entity;
        if (user) {
          user.password = null;
          delete user.password;
          user.salt = null;
          delete user.salt;
          user.token = null;
          delete user.token;
        }
        return entity;
      });
    }
    return {
      value: newFunction
    };
  };
};
