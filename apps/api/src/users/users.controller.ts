import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import type { RequestWithUser } from '../auth/auth.types';
import { UpdateJobFilterPreferenceDto } from './dto/update-job-filter-preference.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get('me/job-filter')
  getJobFilter(@Req() req: RequestWithUser) {
    if (!req.user) return { filter: null, authenticated: false };
    return this.usersService.getJobFilterPreference(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/job-filter')
  updateJobFilter(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateJobFilterPreferenceDto,
  ) {
    return this.usersService.updateJobFilterPreference(
      req.user!.id,
      dto.filter,
    );
  }
}
