import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma, User } from 'src/generated/prisma/client';

const userSafeSelect = {
  id: true,
  email: true,
  name: true,
  password: false,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: userSafeSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createUser(data: Prisma.UserCreateInput): Promise<SafeUser> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: { ...data, password: hashPassword },
      select: userSafeSelect,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<SafeUser> {
    const { where, data } = params;

    if (typeof data.password === 'string') {
      data.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      data,
      where,
      select: userSafeSelect,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<SafeUser> {
    return this.prisma.user.delete({
      where,
      select: userSafeSelect,
    });
  }
}
