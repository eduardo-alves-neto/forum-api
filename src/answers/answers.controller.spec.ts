import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';

describe('AnswersController', () => {
  let controller: AnswersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswersController],
      providers: [
        {
          provide: AnswersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        { provide: JwtService, useValue: { verify: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AnswersController>(AnswersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
