interface PermissionConfigInterface {
  superRole: superRole;
  defaultRoutes?: Array<RoutePayloadInterface>;
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
  resource?: string;
  description?: string;
  isDefault?: boolean;
}

export interface ModulesPayloadInterface {
  name: string;
  resource: string;
  icon: string;
  hasSubmodules: boolean;
  route?: string;
  submodules?: Array<SubModulePayloadInterface>;
  permissions?: Array<PermissionPayload>;
}

export interface SubModulePayloadInterface {
  name: string;
  resource?: string;
  icon: string;
  route?: string;
  permissions?: Array<PermissionPayload>;
}

export interface PermissionPayload {
  name: string;
  resource?: string;
  route: Array<RoutePayloadInterface>;
}

export const PermissionConfiguration: PermissionConfigInterface = {
  superRole: {
    name: 'superuser',
    description: 'superuser of the system'
  },
  defaultRoutes: [
    {
      path: '/check',
      method: MethodList.GET
    },
    {
      path: '/auth/register',
      method: MethodList.POST
    },
    {
      path: '/auth/login',
      method: MethodList.POST
    },
    {
      path: '/auth/profile',
      method: MethodList.GET
    },
    {
      path: '/auth/activate-account',
      method: MethodList.GET
    },
    {
      path: '/auth/forgot-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/reset-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/change-password',
      method: MethodList.PUT
    },
    {
      path: '/auth/profile',
      method: MethodList.PUT
    }
  ],
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
              name: 'View all user',
              route: [
                {
                  path: '/users',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'Store new user',
              route: [
                {
                  path: '/users',
                  method: MethodList.POST
                }
              ]
            },
            {
              name: 'Update user by id',
              route: [
                {
                  path: '/users/:id',
                  method: MethodList.PUT
                }
              ]
            },
            {
              name: 'Delete user by id',
              route: [
                {
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
              name: 'View all role',
              route: [
                {
                  path: '/roles',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'View role by id',
              route: [
                {
                  path: '/roles/:id',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'Store new role',
              route: [
                {
                  path: '/roles',
                  method: MethodList.POST
                }
              ]
            },
            {
              name: 'Update role by id',
              route: [
                {
                  path: '/roles/:id',
                  method: MethodList.PUT
                }
              ]
            },
            {
              name: 'Delete role by id',
              route: [
                {
                  path: '/roles/:id',
                  method: MethodList.DELETE
                }
              ]
            }
          ]
        },
        {
          name: 'Permission',
          resource: 'permission',
          icon: `permission-icon`,
          route: '/permissions',
          permissions: [
            {
              name: 'View all permission',
              route: [
                {
                  path: '/permissions',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'View permission by id',
              route: [
                {
                  path: '/permissions/:id',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'Store new permission',
              route: [
                {
                  path: '/permissions',
                  method: MethodList.POST
                }
              ]
            },
            {
              name: 'Update permission by id',
              route: [
                {
                  path: '/permissions/:id',
                  method: MethodList.PUT
                }
              ]
            },
            {
              name: 'Delete permission by id',
              route: [
                {
                  path: '/permissions/:id',
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
