import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from 'src/generated/prisma/client';

@Controller('auth')
export class AuthController {
  @Inject()
  private readonly authService: AuthService;

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() body: Prisma.UserCreateInput) {
    return this.authService.signin(body);
  }
}
