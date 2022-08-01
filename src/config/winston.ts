import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { WinstonModuleOptions } from 'nest-winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import * as config from 'config';

const isProduction = process.env.NODE_ENV === 'production';
const winstonConfig = config.get('winston');

export default {
  format: winston.format.colorize(),
  exitOnError: false,
  transports: isProduction
    ? new WinstonCloudWatch({
        name: 'Truthy CMS',
        awsOptions: {
          credentials: {
            accessKeyId:
              process.env.AWS_ACCESS_KEY || winstonConfig.awsAccessKeyId,
            secretAccessKey:
              process.env.AWS_KEY_SECRET || winstonConfig.awsSecretAccessKey
          }
        },
        logGroupName:
          process.env.CLOUDWATCH_GROUP_NAME || winstonConfig.groupName,
        logStreamName:
          process.env.CLOUDWATCH_STREAM_NAME || winstonConfig.streamName,
        awsRegion: process.env.CLOUDWATCH_AWS_REGION || winstonConfig.awsRegion,
        messageFormatter: function (item) {
          return (
            item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta)
          );
        }
      })
    : new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          nestWinstonModuleUtilities.format.nestLike('Truthy Logger', {
            prettyPrint: true
          })
        )
      })
} as WinstonModuleOptions;
