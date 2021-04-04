import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import * as ormConfig from './config/ormconfig';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as config from 'config';
const mailConfig = config.get('mail');

@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    MailerModule.forRoot({
      transport: `smtps://${mailConfig.user}:${mailConfig.pass}@${mailConfig.host}`,
      defaults: {
        from: `"${mailConfig.from}" <${mailConfig.fromMail}>`
      },
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true
        }
      }
    }),
    AuthModule,
    RolesModule,
    PermissionsModule
  ]
})
export class AppModule {}
