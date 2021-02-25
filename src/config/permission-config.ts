interface PermissionConfigInterface {
  superRole: superRole;
  defaultPermissionGrantedRoutes?: Array<RoutePayload>;
  permissionDeniedToSuperUserRoutes?: Array<RoutePayload>;
  modules: Array<ModulesPayload>;
}

interface superRole {
  name: string;
  description: string;
}

enum MethodList {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  ANY = 'any',
  OPTIONS = 'options'
}

interface RoutePayload {
  url: string;
  method: MethodList;
}

interface ModulesPayload {
  name: string;
  resource: string;
  icon: string;
  hasSubmodules: boolean;
  route?: string;
  submodules?: Array<SubModulePayload>;
  permissions?: Array<PermissionPayload>;
}

interface SubModulePayload {
  name: string;
  icon: string;
  route?: string;
  permissions?: Array<PermissionPayload>;
}

interface PermissionPayload {
  name: string;
  route: Array<RoutePayload>;
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
          name: 'Users',
          icon: `user-icon`,
          route: '/users',
          permissions: [
            {
              name: 'View user',
              route: [
                {
                  url: '/users',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'Store user',
              route: [
                {
                  url: '/users',
                  method: MethodList.POST
                }
              ]
            },
            {
              name: 'Update user',
              route: [
                {
                  url: '/users/:id',
                  method: MethodList.PUT
                }
              ]
            },
            {
              name: 'Delete user',
              route: [
                {
                  url: '/users/:id',
                  method: MethodList.DELETE
                }
              ]
            }
          ]
        },
        {
          name: 'Roles',
          icon: `role-icon`,
          route: '/roles',
          permissions: [
            {
              name: 'View role',
              route: [
                {
                  url: '/roles',
                  method: MethodList.GET
                }
              ]
            },
            {
              name: 'Store role',
              route: [
                {
                  url: '/roles',
                  method: MethodList.POST
                }
              ]
            },
            {
              name: 'Update role',
              route: [
                {
                  url: '/roles/:id',
                  method: MethodList.PUT
                }
              ]
            },
            {
              name: 'Delete role',
              route: [
                {
                  url: '/roles/:id',
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
