//src/modules/master-company/master-company.staff.public.service.ts

import { Injectable } from '@nestjs/common';
import { Staff } from './staff/entities/staff.entity';
import { MasterCompanyStaffService } from './staff/master-company.staff.service';

@Injectable()
export class MasterCompanyPublicStaffService {
  constructor(private readonly internalService: MasterCompanyStaffService) {}
  //single
  async getStaffInfo(id: string): Promise<Staff> {
    return this.internalService.findOne(id);
  }

  async getAllActiveStaff(): Promise<Staff[]> {
    return this.internalService.findActive();
  }
  async getStaffsByIds(ids: string[]): Promise<Staff[]> {
    if (!ids || ids.length === 0) return [];
    return this.internalService.findByIds(ids);
  }
}
