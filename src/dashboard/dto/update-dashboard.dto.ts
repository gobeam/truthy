import { PartialType } from '@nestjs/swagger';

import { CreateDashboardDto } from 'src/dashboard/dto/create-dashboard.dto';

export class UpdateDashboardDto extends PartialType(CreateDashboardDto) {}
