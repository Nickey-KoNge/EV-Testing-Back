//src/modules/master-company/staff/master-company.staff.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MasterCompanyStaffService } from './master-company.staff.service';
import { CreateStaffDto } from './dtos/create.staff.dto';
import { UpdateStaffDto } from './dtos/update.staff.dto';

@Controller('master-company/staffs')
export class MasterCompanyStaffController {
  constructor(
    private readonly masterCompanyStaffService: MasterCompanyStaffService,
  ) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('listId') lastId?: string,
    @Query('lastCreatedAt') lastCreatedAt?: string,
  ) {
    return this.masterCompanyStaffService.findAll(
      limit,
      page,
      lastId,
      lastCreatedAt,
      search,
    );
  }
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createStaffDto: CreateStaffDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.masterCompanyStaffService.create(createStaffDto, file);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterCompanyStaffService.findOne(id);
  }
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.masterCompanyStaffService.update(id, updateStaffDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterCompanyStaffService.remove(id);
  }
}
