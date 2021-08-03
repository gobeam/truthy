import { IsBoolean, IsNotEmpty } from 'class-validator';

export class TwoFaStatusUpdateDto {
  @IsBoolean()
  isTwoFAEnabled: boolean;
}
