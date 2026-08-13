import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { PrismaService } from 'src/database/prisma.service';

describe('AnswersService', () => {
  let service: AnswersService;
  let prisma: {
    answers: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    questions: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      answers: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      questions: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AnswersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<AnswersService>(AnswersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws NotFoundException when creating an answer for a missing question', async () => {
    prisma.questions.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ body: 'some answer', questionId: 1 }, 1),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates an answer when the question exists', async () => {
    prisma.questions.findUnique.mockResolvedValue({ id: 1 });
    prisma.answers.create.mockResolvedValue({ id: 1, body: 'some answer' });

    await expect(
      service.create({ body: 'some answer', questionId: 1 }, 1),
    ).resolves.toEqual({ id: 1, body: 'some answer' });
  });

  it('throws NotFoundException when the answer does not exist', async () => {
    prisma.answers.findUnique.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws ForbiddenException when a non-owner tries to update', async () => {
    prisma.answers.findUnique.mockResolvedValue({ id: 1, userId: 2 });

    await expect(
      service.update(1, { body: 'edited' }, 99),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows the owner to remove the answer', async () => {
    prisma.answers.findUnique.mockResolvedValue({ id: 1, userId: 2 });
    prisma.answers.delete.mockResolvedValue({ id: 1, userId: 2 });

    await expect(service.remove(1, 2)).resolves.toEqual({ id: 1, userId: 2 });
  });
});
