import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { RequestWithUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AssetsService } from './assets.service';
import { CreateCompanyLogoUploadUrlDto } from './dto/create-company-logo-upload-url.dto';

@ApiTags('assets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post('company-logo/upload-url')
  createCompanyLogoUploadUrl(
    @Req() req: RequestWithUser,
    @Body() dto: CreateCompanyLogoUploadUrlDto,
  ) {
    return this.assetsService.createCompanyLogoUploadUrl(req.user!.id, dto);
  }

  @Post(':id/complete')
  completeUpload(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.assetsService.completeUpload(req.user!.id, id);
  }
}
