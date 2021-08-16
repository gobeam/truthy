import { PartialType } from '@nestjs/swagger';
import { CreateDashboardDto } from './create-dashboard.dto';

export class UpdateDashboardDto extends PartialType(CreateDashboardDto) {}
