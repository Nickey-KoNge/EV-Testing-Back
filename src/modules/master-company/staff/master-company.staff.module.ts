//src/modules/master-company/staff/master-company.staff.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { MasterCompanyStaffService } from './master-company.staff.service';
import { MasterCompanyStaffController } from './master-company.staff.controller';
import { MasterCompanyPublicStaffService } from '../master-company.staff.public.service';

@Module({
  imports: [TypeOrmModule.forFeature([Staff])],
  providers: [MasterCompanyStaffService, MasterCompanyPublicStaffService],
  controllers: [MasterCompanyStaffController],
})
export class MasterCompanyStaffModule {}
