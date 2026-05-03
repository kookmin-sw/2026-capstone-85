import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
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
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);
    if (!token) return true;

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
        companyId: payload.companyId,
      };
    } catch {
      request.user = undefined;
    }
    return true;
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
