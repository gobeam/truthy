interface PermissionConfigInterface {
  superRole: superRole;
  defaultPermissionGrantedRoutes?: Array<RoutePayloadInterface>;
  permissionDeniedToSuperUserRoutes?: Array<RoutePayloadInterface>;
  modules: Array<ModulesPayloadInterface>;
}

interface superRole {
  name: string;
  description: string;
}

export enum MethodList {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  ANY = 'any',
  OPTIONS = 'options'
}

export interface RoutePayloadInterface {
  path: string;
  method: MethodList;
  description?: string;
  resource?: string;
}

interface ModulesPayloadInterface {
  name: string;
  resource: string;
  icon: string;
  hasSubmodules: boolean;
  route?: string;
  submodules?: Array<SubModulePayloadInterface>;
  permissions?: Array<PermissionPayload>;
}

interface SubModulePayloadInterface {
  name: string;
  resource?: string;
  icon: string;
  route?: string;
  permissions?: Array<PermissionPayload>;
}

interface PermissionPayload {
  name: string;
  route: Array<RoutePayloadInterface>;
}

export const PermissionConfiguration: PermissionConfigInterface = {
  superRole: {
    name: 'superuser',
    description: 'superuser of the system'
  },
  defaultPermissionGrantedRoutes: [],
  permissionDeniedToSuperUserRoutes: [],
  modules: [
    {
      name: 'User management',
      resource: 'user',
      icon: `user-management-icon`,
      hasSubmodules: true,
      submodules: [
        {
          resource: 'user',
          name: 'Users',
          icon: `user-icon`,
          route: '/users',
          permissions: [
            {
              name: 'View user',
              route: [
                {
                  description: 'View all user',
                  path: '/users',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'Store user',
              route: [
                {
                  description: 'Store new user',
                  path: '/users',
                  method: MethodList.POST
                }
              ]
            },
            {
              name: 'Update user',
              route: [
                {
                  description: 'Update existing user',
                  path: '/users/:id',
                  method: MethodList.PUT
                }
              ]
            },
            {
              name: 'Delete user',
              route: [
                {
                  description: 'Delete user',
                  path: '/users/:id',
                  method: MethodList.DELETE
                }
              ]
            }
          ]
        },
        {
          name: 'Roles',
          resource: 'role',
          icon: `role-icon`,
          route: '/roles',
          permissions: [
            {
              name: 'View role',
              route: [
                {
                  description: 'View all role',
                  path: '/roles',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'Store role',
              route: [
                {
                  description: 'Store new role',
                  path: '/roles',
                  method: MethodList.POST
                }
              ]
            },
            {
              name: 'Update role',
              route: [
                {
                  description: 'update existing role',
                  path: '/roles/:id',
                  method: MethodList.PUT
                }
              ]
            },
            {
              name: 'Delete role',
              route: [
                {
                  description: 'Delete existing role',
                  path: '/roles/:id',
                  method: MethodList.DELETE
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
