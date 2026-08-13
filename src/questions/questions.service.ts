import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { PrismaService } from 'src/database/prisma.service';

const questionInclude = {
  answers: true,
  user: {
    select: {
      name: true,
      email: true,
    },
  },
};

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto, userId: number) {
    return this.prisma.questions.create({
      data: { ...createQuestionDto, userId },
    });
  }

  async findAll() {
    return this.prisma.questions.findMany({
      include: questionInclude,
    });
  }

  async findOne(id: number) {
    const question = await this.prisma.questions.findUnique({
      where: { id },
      include: questionInclude,
    });
    if (!question) throw new NotFoundException('Question not found');
    return question;
  }

  async update(
    id: number,
    updateQuestionDto: UpdateQuestionDto,
    userId: number,
  ) {
    await this.ensureOwnership(id, userId);
    return this.prisma.questions.update({
      where: { id },
      data: updateQuestionDto,
    });
  }

  async remove(id: number, userId: number) {
    await this.ensureOwnership(id, userId);
    return this.prisma.questions.delete({ where: { id } });
  }

  private async ensureOwnership(id: number, userId: number) {
    const question = await this.prisma.questions.findUnique({
      where: { id },
    });
    if (!question) throw new NotFoundException('Question not found');
    if (question.userId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to modify this question',
      );
    }
  }
}
