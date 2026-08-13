import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { PrismaService } from 'src/database/prisma.service';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let prisma: {
    questions: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      questions: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws NotFoundException when the question does not exist', async () => {
    prisma.questions.findUnique.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException when a non-owner tries to update', async () => {
    prisma.questions.findUnique.mockResolvedValue({ id: 1, userId: 2 });

    await expect(
      service.update(1, { title: 'new title' }, 99),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the owner to update the question', async () => {
    prisma.questions.findUnique.mockResolvedValue({ id: 1, userId: 2 });
    prisma.questions.update.mockResolvedValue({ id: 1, userId: 2 });

    await expect(service.update(1, { title: 'new title' }, 2)).resolves.toEqual(
      { id: 1, userId: 2 },
    );
  });
});
