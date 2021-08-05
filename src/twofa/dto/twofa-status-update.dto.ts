import { IsBoolean } from 'class-validator';

export class TwoFaStatusUpdateDto {
  @IsBoolean()
  isTwoFAEnabled: boolean;
}
