// src/modules/master-company/branch/master-company.branch.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { MasterCompanyBranchService } from './master-company.branch.service';
import { MasterCompanyBranchController } from './master-company.branch.controller';
import { MasterCompanyPublicBranchService } from '../master-company.branch.public.service';

@Module({
  imports: [TypeOrmModule.forFeature([Branch])],
  providers: [MasterCompanyBranchService, MasterCompanyPublicBranchService],
  controllers: [MasterCompanyBranchController],
  exports: [MasterCompanyPublicBranchService], // တခြား Module က သုံးချင်ရင် export လုပ်ထားရမယ်
})
export class MasterCompanyBranchModule {}
