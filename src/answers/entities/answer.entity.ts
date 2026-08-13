import { Answers } from 'src/generated/prisma/client';

export class Answer implements Answers {
  id: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  questionId: number;
}
