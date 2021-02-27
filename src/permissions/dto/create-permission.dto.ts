import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MethodList } from '../../config/permission-config';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  resource: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  path: string;

  @IsNotEmpty()
  @IsEnum(MethodList)
  method: MethodList;
}
