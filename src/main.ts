import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Logger,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as config from 'config';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const serverConfig = config.get('server');
  const port = process.env.PORT || serverConfig.port;
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({ origin: serverConfig.origin });
    logger.log(`Accepting request only from: ${serverConfig.origin}`);
  }
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        const errorMessages = {};
        errors.forEach(
          (error) =>
            (errorMessages[error.property] = Object.values(error.constraints)
              .join('. ')
              .trim()),
        );
        return new UnprocessableEntityException(errorMessages);
      },
    }),
  );
  await app.listen(port);
  logger.log(`Application listening in port: ${port}`);
}

bootstrap();
