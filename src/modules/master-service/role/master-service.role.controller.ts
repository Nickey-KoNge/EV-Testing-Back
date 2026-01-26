//src/modules/master-service/role/master-service.role.controller.ts
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
import { MasterServiceRoleService } from './master-service.role.service';
import { CreateRoleDto } from './dtos/create.role.dto';
import { UpdateRoleDto } from './dtos/update.role.dto';

@Controller('master-service/roles')
export class MasterServiceRoleController {
  constructor(
    private readonly masterServiceRoleService: MasterServiceRoleService,
  ) {}
  @Post()
  create(@Body() CreateRoleDto: CreateRoleDto) {
    return this.masterServiceRoleService.create(CreateRoleDto);
  }

  // @Get()
  // findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
  //   return this.masterServiceRoleService.findAll(page, limit);
  // }
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('lastId') lastId?: string,
    @Query('lastCreatedAt') lastCreatedAt?: string,
  ) {
    return this.masterServiceRoleService.findAll(
      limit,
      page,
      lastId,
      lastCreatedAt,
      search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.masterServiceRoleService.findOne(id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.masterServiceRoleService.update(id, updateRoleDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.masterServiceRoleService.remove(id);
  }
}
