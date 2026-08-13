import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from 'src/database/prisma.service';

const answerInclude = {
  user: {
    select: {
      name: true,
      email: true,
    },
  },
};

@Injectable()
export class AnswersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAnswerDto: CreateAnswerDto, userId: number) {
    const question = await this.prisma.questions.findUnique({
      where: { id: createAnswerDto.questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    return this.prisma.answers.create({
      data: { ...createAnswerDto, userId },
    });
  }

  async findAll(questionId?: number) {
    return this.prisma.answers.findMany({
      where: questionId ? { questionId } : undefined,
      include: answerInclude,
    });
  }

  async findOne(id: number) {
    const answer = await this.prisma.answers.findUnique({
      where: { id },
      include: answerInclude,
    });
    if (!answer) throw new NotFoundException('Answer not found');
    return answer;
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto, userId: number) {
    await this.ensureOwnership(id, userId);
    return this.prisma.answers.update({
      where: { id },
      data: updateAnswerDto,
    });
  }

  async remove(id: number, userId: number) {
    await this.ensureOwnership(id, userId);
    return this.prisma.answers.delete({ where: { id } });
  }

  private async ensureOwnership(id: number, userId: number) {
    const answer = await this.prisma.answers.findUnique({ where: { id } });
    if (!answer) throw new NotFoundException('Answer not found');
    if (answer.userId !== userId) {
      throw new ForbiddenException('You are not allowed to modify this answer');
    }
  }
}
