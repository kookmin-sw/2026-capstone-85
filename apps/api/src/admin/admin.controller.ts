import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobStatus, UserRole } from '@prisma/client';
import type { RequestWithUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AdminService } from './admin.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminService: AdminService,
  ) {}

  @Get('health')
  health() {
    return { ok: true, area: 'admin' };
  }

  @Post('jobs')
  createJob(@Body() dto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        companyId: dto.companyId,
        sourceId: dto.sourceId,
        originalUrl: dto.originalUrl,
        jobFamily: dto.jobFamily,
        employmentType: dto.employmentType,
        companyType: dto.companyType,
        kicpaCondition: dto.kicpaCondition,
        traineeStatus: dto.traineeStatus,
        practicalTrainingInstitution: dto.practicalTrainingInstitution,
        minExperienceYears: dto.minExperienceYears,
        location: dto.location,
        deadlineType: dto.deadlineType,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        lastCheckedAt: new Date(),
      },
    });
  }

  @Patch('jobs/:id/close')
  closeJob(@Param('id') id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { status: JobStatus.CLOSED },
    });
  }

  @Get('job-submissions')
  listJobSubmissions() {
    return this.adminService.listJobSubmissions();
  }

  @Patch('job-submissions/:id/approve')
  approveJobSubmission(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.approveJobSubmission(
      id,
      req.user!.id,
      dto.adminNote,
    );
  }

  @Patch('job-submissions/:id/reject')
  rejectJobSubmission(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.rejectJobSubmission(
      id,
      req.user!.id,
      dto.adminNote,
    );
  }

  @Get('profile-submissions')
  listProfileSubmissions() {
    return this.adminService.listProfileSubmissions();
  }

  @Patch('profile-submissions/:id/approve')
  approveProfileSubmission(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.approveProfileSubmission(
      id,
      req.user!.id,
      dto.adminNote,
    );
  }

  @Patch('profile-submissions/:id/reject')
  rejectProfileSubmission(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.adminService.rejectProfileSubmission(
      id,
      req.user!.id,
      dto.adminNote,
    );
  }
}
