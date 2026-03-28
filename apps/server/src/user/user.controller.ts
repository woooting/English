import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import type { UserLogin, UserRegister } from '@en/common/user';
import type { Token } from '@en/common/user';
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
}
