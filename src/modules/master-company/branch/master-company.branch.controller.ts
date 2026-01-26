// src/modules/master-company/branch/master-company.branch.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { MasterCompanyBranchService } from './master-company.branch.service';
import { CreateBranchDto } from './dtos/create-branch.dto';
import { UpdateBranchDto } from './dtos/update-branch.dto';

@Controller('master-company/branches')
export class MasterCompanyBranchController {
  constructor(
    private readonly masterCompanyBranchService: MasterCompanyBranchService,
  ) {}

  @Post()
  create(@Body() createBranchDto: CreateBranchDto) {
    return this.masterCompanyBranchService.create(createBranchDto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('lastId') lastId?: string,
    @Query('lastCreatedAt') lastCreatedAt?: string,
  ) {
    return this.masterCompanyBranchService.findAll(
      limit,
      page,
      lastId,
      lastCreatedAt,
      search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterCompanyBranchService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto) {
    return this.masterCompanyBranchService.update(id, updateBranchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterCompanyBranchService.remove(id);
  }
}
