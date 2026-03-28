import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { RefreshTokenPayload } from '@en/common/user';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: RefreshTokenPayload;
    }>();
    const { authorization } = request.headers;
    // 判断登录请求是否由客户端发送
    if (!authorization) {
      throw new UnauthorizedException('请先登录');
    }
    const token = authorization.split(' ')[1];
    try {
      const decoded = this.jwtService.verify<RefreshTokenPayload>(token);
      if (decoded.tokenType !== 'access') {
        throw new UnauthorizedException('token无效');
      }
      request.user = decoded;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('token过期');
    }
    return true;
  }
}
