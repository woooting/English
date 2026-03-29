import {
  Controller,
  Post,
  Req,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import type { Request } from 'express';
import type { UserLogin, UserRegister, UserUpdate } from '@en/common/user';
import type { Token } from '@en/common/user';
import { AuthGuard } from '@libs/shared/auth/auth.guard';
import { UseGuards } from '@nestjs/common';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() createUserDto: UserRegister) {
    return this.userService.register(createUserDto);
  }

  @Post('login')
  login(@Body() UserloginDto: UserLogin) {
    return this.userService.login(UserloginDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: Omit<Token, 'accessToken'>) {
    return this.userService.refreshToken(refreshTokenDto);
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  upoloadAvatar(@UploadedFile() file: Express.Multer.File) {
    return this.userService.upoloadAvatar(file);
  }

  @Post('update-user')
  @UseGuards(AuthGuard)
  updateUser(@Body() updateUserDto: UserUpdate, @Req() req: Request) {
    const payload = req.user;
    return this.userService.updateUserSetting(updateUserDto, payload);
  }
}
