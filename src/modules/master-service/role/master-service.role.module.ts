//src/modules/master-service/role/master-service.role.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { MasterServiceRoleController } from './master-service.role.controller';
import { MasterServiceRoleService } from './master-service.role.service';
import { MasterServicePublicRoleService } from '../master-service.role.public.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [MasterServiceRoleService, MasterServicePublicRoleService],
  controllers: [MasterServiceRoleController],
  exports: [MasterServicePublicRoleService],
})
export class MasterServiceRoleModule {}
