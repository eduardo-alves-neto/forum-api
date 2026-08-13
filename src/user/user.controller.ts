import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserService, SafeUser } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async signupUser(@Body() createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.userService.createUser(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number): Promise<SafeUser> {
    return this.userService.user({ id });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() userData: UpdateUserDto,
  ): Promise<SafeUser> {
    return this.userService.updateUser({
      where: { id },
      data: userData,
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<SafeUser> {
    return this.userService.deleteUser({ id });
  }
}
