import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import path, { join } from 'path';
import config from 'config';
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
  AcceptLanguageResolver
} from 'nestjs-i18n';
import { WinstonModule } from 'nest-winston';

import { AuthModule } from 'src/auth/auth.module';
import { RolesModule } from 'src/role/roles.module';
import { PermissionsModule } from 'src/permission/permissions.module';
import { AppDataSource } from 'src/config/ormconfig';
import { throttleConfig } from 'src/config/throttle-config';
import { MailModule } from 'src/mail/mail.module';
import { EmailTemplateModule } from 'src/email-template/email-template.module';
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';
import { I18nExceptionFilterPipe } from 'src/common/pipes/i18n-exception-filter.pipe';
import { CustomValidationPipe } from 'src/common/pipes/custom-validation.pipe';
import { TwofaModule } from 'src/twofa/twofa.module';
import { CustomThrottlerGuard } from 'src/common/guard/custom-throttle.guard';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { AppController } from 'src/app.controller';
import winstonConfig from 'src/config/winston';

const appConfig = config.get('app');

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => AppDataSource.options
    }),
    I18nModule.forRoot({
      fallbackLanguage: appConfig.fallbackLanguage,
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
        new HeaderResolver(['x-custom-lang']),
        new CookieResolver(['lang', 'locale', 'l'])
      ]
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*']
    }),
    AuthModule,
    RolesModule,
    PermissionsModule,
    MailModule,
    EmailTemplateModule,
    RefreshTokenModule,
    TwofaModule,
    DashboardModule
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe
    },
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard
    },
    {
      provide: APP_FILTER,
      useClass: I18nExceptionFilterPipe
    }
  ],
  controllers: [AppController]
})
export class AppModule {}
