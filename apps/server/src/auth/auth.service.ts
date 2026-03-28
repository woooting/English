import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { TokenPayload, Token, RefreshTokenPayload } from '@en/common/user';
@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}
  generateToken(payload: TokenPayload): Token {
    return {
      //塞数据生成token
      accessToken: this.jwtService.sign<RefreshTokenPayload>({
        ...payload,
        tokenType: 'access',
      }),
      refreshToken: this.jwtService.sign<RefreshTokenPayload>(
        {
          ...payload,
          tokenType: 'refresh',
        },
        { expiresIn: '7d' },
      ),
    };
  }
}
