import { IsIP } from 'class-validator';

export class RequestIpDto {
  @IsIP()
  ip: string;
}
