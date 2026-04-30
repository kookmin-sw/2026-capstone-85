import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from './auth.types';

type JwtPayload = {
  sub: string;
  username: string;
  role: UserRole;
  companyId: string | null;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        companyId: payload.companyId,
      };
      return true;
    } catch {
      throw new UnauthorizedException('인증 토큰이 유효하지 않습니다.');
    }
  }

  private extractToken(request: RequestWithUser) {
    const cookieToken = this.readAccessTokenCookie(request.cookies);
    if (cookieToken) return cookieToken;

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return undefined;
    return authHeader.slice('Bearer '.length);
  }

  private readAccessTokenCookie(cookies: unknown) {
    if (!cookies || typeof cookies !== 'object') return undefined;
    const token = (cookies as { access_token?: unknown }).access_token;
    return typeof token === 'string' ? token : undefined;
  }
}
