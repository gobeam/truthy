import { DynamicModule, Provider } from '@nestjs/common';

export const createMockModule = (providers: Provider[]): DynamicModule => {
  const exports = providers.map(
    (provider) => (provider as any).provide || provider
  );
  return {
    module: class MockModule {},
    providers,
    exports,
    global: true
  };
};
