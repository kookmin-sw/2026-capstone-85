import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompanyType, User, UserRole } from '@prisma/client';
import argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type SafeUser = Pick<
  User,
  'id' | 'username' | 'displayName' | 'role' | 'companyId'
>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }

    let companyId: string | undefined;
    if (dto.role === UserRole.COMPANY) {
      if (!dto.companyName) {
        throw new BadRequestException('기업회원은 회사명이 필요합니다.');
      }
      const company = await this.prisma.company.upsert({
        where: { name: dto.companyName },
        update: {},
        create: {
          name: dto.companyName,
          type: dto.companyType ?? CompanyType.LOCAL_ACCOUNTING_FIRM,
        },
      });
      companyId = company.id;
    }

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        passwordHash: await argon2.hash(dto.password),
        displayName: dto.displayName,
        role: dto.role,
        companyId,
      },
    });

    return this.toAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException(
        '아이디 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    return this.toAuthResponse(user);
  }

  async findSafeUser(userId: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        companyId: true,
      },
    });
  }

  private toAuthResponse(user: SafeUser) {
    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      companyId: user.companyId,
    };
    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
    });

    return { user: safeUser, accessToken };
  }
}
