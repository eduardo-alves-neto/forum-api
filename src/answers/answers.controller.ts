import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import type { AuthenticatedRequest } from 'src/auth/types';

@Controller('answers')
@UseGuards(AuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  create(
    @Body() createAnswerDto: CreateAnswerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.answersService.create(createAnswerDto, req.sub.sub);
  }

  @Get()
  findAll(
    @Query('questionId', new ParseIntPipe({ optional: true }))
    questionId?: number,
  ) {
    return this.answersService.findAll(questionId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.answersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAnswerDto: UpdateAnswerDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.answersService.update(id, updateAnswerDto, req.sub.sub);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.answersService.remove(id, req.sub.sub);
  }
}
