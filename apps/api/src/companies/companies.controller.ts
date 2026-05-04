import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { ListCompaniesDto } from './dto/list-companies.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  list(@Query() query: ListCompaniesDto) {
    return this.companiesService.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.companiesService.detail(id);
  }
}
