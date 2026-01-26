// src/modules/master-service/master-service.role.public.service.ts
import { Injectable } from '@nestjs/common';
import { MasterServiceRoleService } from './role/master-service.role.service';
import { Role } from './role/entities/role.entity';

@Injectable()
export class MasterServicePublicRoleService {
  constructor(private readonly internalService: MasterServiceRoleService) {}

  async getRoleInfo(id: string): Promise<Role> {
    return this.internalService.findOne(id);
  }
  async getAllActiveRoles(): Promise<Role[]> {
    return this.internalService.findActive();
  }
  async getRolesByIds(ids: string[]): Promise<Role[]> {
    if (!ids || ids.length === 0) return [];
    return this.internalService.findByIds(ids);
  }
}
