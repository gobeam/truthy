import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { RoleRepository } from './role.repository';
import { RoleFilterDto } from './dto/role-filter.dto';

const roleRepositoryMock = () => ({
  findAll: jest.fn()
});

describe('RolesService', () => {
  let service: RolesService, roleRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useFactory: roleRepositoryMock }
      ]
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  it('findAll', async () => {
    const roleFilterDto: RoleFilterDto = {
      name: 'example'
    };
    roleRepository.findAll.mockResolvedValue('result');
    const result = await service.findAll(roleFilterDto);
    expect(roleRepository.findAll).toHaveBeenCalledWith(roleFilterDto);
    expect(result).toEqual('result');
  });
});
