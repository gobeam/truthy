import { PartialType } from '@nestjs/swagger';
import { CommonSearchFieldDto } from '../../common/extra/common-search-field.dto';

export class PermissionFilterDto extends PartialType(CommonSearchFieldDto) {}
