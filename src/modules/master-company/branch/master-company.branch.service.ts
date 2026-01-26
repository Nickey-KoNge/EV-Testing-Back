// src/modules/master-company/branch/master-company.branch.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { CreateBranchDto } from './dtos/create-branch.dto';
import { UpdateBranchDto } from './dtos/update-branch.dto';

@Injectable()
export class MasterCompanyBranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}
  // Filter data (Only Active record)
  async findActive(): Promise<Branch[]> {
    return await this.branchRepository.find({
      where: { status: ILike('Active') },
      select: ['id', 'branch_name'],
    });
  }

  // N+1 Query Problem protect (get sale record from db and branch also call same like sale record from db)
  async findByIds(ids: string[]): Promise<Branch[]> {
    return await this.branchRepository.find({
      where: { id: In(ids) },
    });
  }

  // Read One
  async findOne(id: string): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id } });
    if (!branch) throw new NotFoundException(`Branch with ID ${id} not found`);
    return branch;
  }

  //Basic CRUD Code

  // Create
  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const branch = this.branchRepository.create(createBranchDto);
    return await this.branchRepository.save(branch);
  }

  async findAll(
    limit: number = 10,
    page?: number,
    lastId?: string,
    lastCreatedAt?: string,
    search?: string,
  ) {
    const queryBuilder = this.branchRepository.createQueryBuilder('branch');

    if (search) {
      queryBuilder.andWhere(
        '(branch.branch_name ILike :search OR branch.address ILike :search)',
        { search: `%${search}%` },
      );
    }

    if (lastId && lastCreatedAt) {
      queryBuilder.andWhere(
        '(branch.created_at < :lastCreatedAt OR (branch.created_at = :lastCreatedAt AND branch.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else if (page && page > 1) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const data = await queryBuilder
      .orderBy('branch.created_at', 'DESC')
      .addOrderBy('branch.id', 'DESC')
      .take(limit)
      .getMany();

    let total: number;
    if (search) {
      total = await queryBuilder.getCount();
    } else {
      const result = await this.branchRepository.query<{ estimate: string }[]>(
        `SELECT reltuples::bigint AS estimate 
          FROM pg_class c 
          JOIN pg_namespace n ON n.oid = c.relnamespace 
          WHERE n.nspname = 'master_company' 
          AND c.relname = 'branches'`,
      );
      total = result && result.length > 0 ? Number(result[0].estimate) : 0;
    }

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update
  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);
    Object.assign(branch, updateBranchDto);
    return await this.branchRepository.save(branch);
  }

  // Delete
  async remove(id: string): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchRepository.remove(branch);
  }
  //Basic CRUD Code
}
