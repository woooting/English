import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/shared';
import { ResponseService } from '@libs/shared';
import type {
  UserLogin,
  UserRegister,
  Token,
  RefreshTokenPayload,
} from '@en/common/user';
import type { Prisma } from '@libs/shared/generated/prisma/client';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private response: ResponseService,
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  //登录
  async login(UserloginDto: UserLogin) {
    const user = await this.prisma.user.findUnique({
      where: {
        phone: UserloginDto.phone,
      },
    });
    if (!user) {
      return this.response.error(null, '手机号不存在');
    }

    if (user.password !== UserloginDto.password) {
      return this.response.error(null, '密码错误');
    }

    const userinfo = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
    const token = this.authService.generateToken({
      userId: userinfo.id,
      email: userinfo.email,
      name: userinfo.name,
    });
    return this.response.success({ ...userinfo, token });
  }

  //注册
  async register(createUserDto: UserRegister) {
    const data: Prisma.UserCreateInput = {
      name: createUserDto.name,
      phone: createUserDto.phone,
      password: createUserDto.password,
      lastLoginAt: new Date(),
    };

    //电话验证
    const phone = await this.prisma.user.findUnique({
      where: {
        phone: createUserDto.phone,
      },
    });

    if (phone) {
      return this.response.error(null, '手机号已注册');
    }

    //邮箱验证
    if (createUserDto.email) {
      const email = await this.prisma.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      });

      if (email) {
        return this.response.error(null, '邮箱已注册');
      }
      data.email = createUserDto.email;
    }

    const newUser = await this.prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });
    const token = this.authService.generateToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
    return this.response.success({ ...newUser, token });
  }

  //刷新token
  async refreshToken(refreshTokenDto: Omit<Token, 'accessToken'>) {
    try {
      //token解析获得userID
      const decoded = this.jwtService.verify<RefreshTokenPayload>(
        refreshTokenDto.refreshToken,
      );
      if (decoded.tokenType !== 'refresh') {
        return this.response.error(null, 'refreshToken无效');
      }
      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.userId,
        },
      });
      if (!user) {
        return this.response.error(null, '用户不存在');
      }
      const token = this.authService.generateToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      return this.response.success(token);
    } catch (error) {
      return this.response.error(null, 'token无效');
    }
  }
}
