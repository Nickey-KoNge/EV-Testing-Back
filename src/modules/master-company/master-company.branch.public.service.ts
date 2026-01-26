// src/modules/master-company/master-company.branch.public.service.ts
import { Injectable } from '@nestjs/common';
import { MasterCompanyBranchService } from './branch/master-company.branch.service';
import { Branch } from './branch/entities/branch.entity';

@Injectable()
export class MasterCompanyPublicBranchService {
  constructor(private readonly internalService: MasterCompanyBranchService) {}

  // Single Branch သိလိုလျှင်
  async getBranchInfo(id: string): Promise<Branch> {
    return this.internalService.findOne(id);
  }
  //ACTIVE ဖြစ်နေသော Branch များအားလုံးကို DB မှ တိုက်ရိုက် Filter လုပ်၍ယူခြင်း
  async getAllActiveBranches(): Promise<Branch[]> {
    return this.internalService.findActive();
  }
  //Batch Loading Method (N+1 Problem ကို ကာကွယ်ရန် အရေးကြီးဆုံး Method)
  async getBranchesByIds(ids: string[]): Promise<Branch[]> {
    if (!ids || ids.length === 0) return [];
    return this.internalService.findByIds(ids);
  }
}
