import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateAnswerDto } from './create-answer.dto';

export class UpdateAnswerDto extends PartialType(
  OmitType(CreateAnswerDto, ['questionId'] as const),
) {}
