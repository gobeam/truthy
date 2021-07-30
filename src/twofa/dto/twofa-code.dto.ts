import { IsNotEmpty } from 'class-validator';

export class TwofaCodeDto {
  @IsNotEmpty()
  code: string;
}
