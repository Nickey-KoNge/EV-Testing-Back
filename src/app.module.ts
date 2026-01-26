// src/app.module.ts
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { MasterCompanyBranchModule } from './modules/master-company/branch/master-company.branch.module';
import { MasterServiceRoleModule } from './modules/master-service/role/master-service.role.module';
import { MasterCompanyStaffModule } from './modules/master-company/staff/master-company.staff.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({ ...typeOrmConfig }),
    MasterCompanyBranchModule,
    MasterCompanyStaffModule,
    MasterServiceRoleModule,
  ],
})
export class AppModule {}
