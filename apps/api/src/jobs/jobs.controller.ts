import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListJobsDto } from './dto/list-jobs.dto';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  list(@Query() query: ListJobsDto) {
    return this.jobsService.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.jobsService.detail(id);
  }
}
