import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import * as ormConfig from './config/ormconfig';
import * as throttleConfig from './config/throttle-config';
import { MailModule } from './mail/mail.module';
import { EmailTemplateModule } from './email-template/email-template.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { RefreshTokenModule } from './refresh-token/refresh-token.module';
import * as path from 'path';
import * as config from 'config';
import {
  I18nModule,
  I18nJsonParser,
  QueryResolver,
  HeaderResolver,
  AcceptLanguageResolver,
  CookieResolver
} from 'nestjs-i18n';
import { CommonExceptionFilter } from './common/exception/exception-filter';
import { I18nValidationPipe } from './common/pipes/i18n-validation.pipe';
const appConfig = config.get('app');

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useFactory: () => throttleConfig
    }),
    TypeOrmModule.forRootAsync({ useFactory: () => ormConfig }),
    I18nModule.forRootAsync({
      useFactory: () => ({
        fallbackLanguage: appConfig.fallbackLanguage,
        parserOptions: {
          path: path.join(__dirname, '/i18n/')
        }
      }),
      parser: I18nJsonParser,
      resolvers: [
        { use: QueryResolver, options: ['lang', 'locale', 'l'] },
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
        new CookieResolver(['lang', 'locale', 'l'])
      ]
    }),
    AuthModule,
    RolesModule,
    PermissionsModule,
    MailModule,
    EmailTemplateModule,
    RefreshTokenModule
  ],
  providers: [
    { provide: APP_PIPE, useClass: I18nValidationPipe },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    // {
    //   provide: APP_FILTER,
    //   useClass: CommonExceptionFilter
    // }
  ]
})
export class AppModule {}
