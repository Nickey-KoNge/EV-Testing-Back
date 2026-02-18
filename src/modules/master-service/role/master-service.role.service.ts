// src/modules/master-service/role/master-service.role.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dtos/create.role.dto';
import { UpdateRoleDto } from './dtos/update.role.dto';

@Injectable()
export class MasterServiceRoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  //Basic CRUD Code
  //Read All
  //   async findAll(): Promise<Role[]> {
  //     return await this.roleRepository.find();
  //   }
  async findAll(
    limit: number = 10,
    page?: number,
    lastId?: string,
    lastCreatedAt?: string,
    search?: string,
  ) {
    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    if (search) {
      queryBuilder.andWhere('(role.role_name ILike :search)', {
        search: `%${search}%`,
      });
    }

    if (lastId && lastCreatedAt) {
      queryBuilder.andWhere(
        '(role.created_at < :lastCreatedAt OR (role.created_at = :lastCreatedAt AND role.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else if (page && page > 1) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const data = await queryBuilder
      .orderBy('role.created_at', 'DESC')
      .addOrderBy('role.id', 'DESC')
      .take(limit)
      .getMany();

    let total: number;
    if (search) {
      total = await queryBuilder.getCount();
    } else {
      const result = await this.roleRepository.query<{ estimate: string }[]>(
        `SELECT reltuples::bigint AS estimate 
          FROM pg_class c 
          JOIN pg_namespace n ON n.oid = c.relnamespace 
          WHERE n.nspname = 'master_service' AND c.relname = 'roles'`,
      );
      total = result && result.length > 0 ? Number(result[0].estimate) : 0;
    }

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  //Create
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }
  // Read One
  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }
  //Update
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }
  //Delete
  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.remove(role);
  }
  //Basic CRUD Code

  async findActive(): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { status: ILike('Active') },
      select: ['id', 'role_name'],
    });
  }
  //N + 1 Query Problem protect
  async findByIds(ids: string[]): Promise<Role[]> {
    return await this.roleRepository.find({
      where: { id: In(ids) },
    });
  }
}
