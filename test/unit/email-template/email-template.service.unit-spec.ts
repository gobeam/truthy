import { Test, TestingModule } from '@nestjs/testing';
import { UnprocessableEntityException } from '@nestjs/common';

import { EmailTemplateService } from 'src/email-template/email-template.service';
import { EmailTemplateRepository } from 'src/email-template/email-template.repository';
import { EmailTemplatesSearchFilterDto } from 'src/email-template/dto/email-templates-search-filter.dto';
import { CreateEmailTemplateDto } from 'src/email-template/dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from 'src/email-template/dto/update-email-template.dto';
import { NotFoundException } from 'src/exception/not-found.exception';
import { ForbiddenException } from 'src/exception/forbidden.exception';

const emailTemplateRepositoryMock = () => ({
  getAll: jest.fn(),
  findOne: jest.fn(),
  countEntityByCondition: jest.fn(),
  updateEntity: jest.fn(),
  get: jest.fn(),
  createEntity: jest.fn(),
  paginate: jest.fn()
});

const mockTemplate = {
  title: 'string',
  slug: 'string',
  sender: 'string',
  subject: 'string',
  body: 'string',
  isDefault: false
};

describe('EmailTemplateService', () => {
  let service: EmailTemplateService, repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplateService,
        {
          provide: EmailTemplateRepository,
          useFactory: emailTemplateRepositoryMock
        }
      ]
    }).compile();

    service = module.get<EmailTemplateService>(EmailTemplateService);
    repository = module.get<EmailTemplateRepository>(EmailTemplateRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('test slugify', () => {
    const result = service.slugify('Test Email');
    expect(result).toEqual('test-email');
  });

  it('get all email-templates', async () => {
    const filter: EmailTemplatesSearchFilterDto = {
      keywords: 'test',
      limit: 10,
      page: 1
    };
    repository.paginate.mockResolvedValue('result');
    const results = await service.findAll(filter);
    expect(repository.paginate).toHaveBeenCalledTimes(1);
    expect(results).toEqual('result');
  });

  it('create email template', async () => {
    const createEmailTemplateDto: CreateEmailTemplateDto = mockTemplate;
    await service.create(createEmailTemplateDto);
    expect(repository.createEntity).toHaveBeenCalledWith(
      createEmailTemplateDto
    );
    expect(repository.createEntity).not.toThrow();
  });

  describe('find email template by id', () => {
    it('role find success', async () => {
      repository.get.mockResolvedValue(mockTemplate);
      const result = await service.findOne(1);
      expect(repository.get).toHaveBeenCalledTimes(1);
      expect(repository.get).not.toThrow();
      expect(result).toBe(mockTemplate);
    });
    it('find fail', async () => {
      repository.get.mockRejectedValue(new NotFoundException());
      await expect(service.findOne(1)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('update email template by id', () => {
    let updateEmailTemplateDto: UpdateEmailTemplateDto;
    beforeEach(() => {
      updateEmailTemplateDto = mockTemplate;
    });
    it('try to update using duplicate title', async () => {
      repository.findOne.mockResolvedValue(mockTemplate);
      repository.countEntityByCondition.mockResolvedValue(1);
      await expect(
        service.update(1, updateEmailTemplateDto)
      ).rejects.toThrowError(UnprocessableEntityException);
      expect(repository.countEntityByCondition).toHaveBeenCalledTimes(1);
    });

    it('update email template that exists in database', async () => {
      repository.countEntityByCondition.mockResolvedValue(0);
      repository.updateEntity.mockResolvedValue(mockTemplate);
      repository.get.mockResolvedValue(mockTemplate);
      const role = await service.update(1, updateEmailTemplateDto);
      expect(repository.get).toHaveBeenCalledWith(1);
      expect(repository.updateEntity).toHaveBeenCalledWith(
        mockTemplate,
        updateEmailTemplateDto
      );
      expect(role).toEqual(mockTemplate);
    });

    it('trying to update email template that does not exists in database', async () => {
      repository.updateEntity.mockRejectedValue(new NotFoundException());
      repository.get.mockResolvedValue(null);
      await expect(
        service.update(1, updateEmailTemplateDto)
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('remove email template by id', () => {
    it('trying to delete existing item', async () => {
      service.findOne = jest.fn().mockResolvedValue(mockTemplate);
      repository.delete = jest.fn().mockResolvedValue('');
      const result = await service.remove(1);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.findOne).not.toThrow();
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(undefined);
    });

    it('trying to delete no existing item', async () => {
      service.findOne = jest.fn().mockImplementation(() => {
        throw NotFoundException;
      });
      await expect(service.remove(1)).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('delete default template test if throws error', async () => {
      service.findOne = jest.fn().mockResolvedValue({
        ...mockTemplate,
        isDefault: true
      });
      await expect(service.remove(1)).rejects.toThrowError(ForbiddenException);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
