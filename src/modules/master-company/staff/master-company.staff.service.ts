// src/modules/master-company/staff/master-company.staff.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dtos/create.staff.dto';
import { UpdateStaffDto } from './dtos/update.staff.dto';

import * as bcrypt from 'bcrypt';

import { OpService } from 'src/common/service/op.service';
import { ImgFileService } from 'src/common/service/imgfile.service';

@Injectable()
export class MasterCompanyStaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly imgFileService: ImgFileService,
    private readonly opService: OpService,
  ) {}

  async findActive(): Promise<Staff[]> {
    return await this.staffRepository.find({
      where: { status: ILike('Active') },
      select: ['id', 'staff_name'],
    });
  }

  // N+1 Query Problem protect (get sale record from db and branch also call same like sale record from db)
  async findByIds(ids: string[]): Promise<Staff[]> {
    return await this.staffRepository.find({
      where: { id: In(ids) },
    });
  }

  // Read One
  async findOne(id: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({ where: { id } });
    if (!staff) throw new NotFoundException(`Staff with ID ${id} not found`);
    return staff;
  }

  //Basic CRUD Code

  // Create and save on local db
  // async create(
  //   createStaffDto: CreateStaffDto,
  //   file: Express.Multer.File,
  // ): Promise<Staff> {
  //   if (!file) {
  //     throw new Error('No file uploaded');
  //   }

  //   const uploadDir = './uploads/staff-images';
  //   if (!fs.existsSync(uploadDir)) {
  //     fs.mkdirSync(uploadDir, { recursive: true });
  //   }

  //   const originalName = file['originalname'];
  //   const fileBuffer = file['buffer'];

  //   const fileName = `${uuidv4()}${path.extname(originalName)}`;
  //   const filePath = path.join(uploadDir, fileName);

  //   fs.writeFileSync(filePath, fileBuffer);
  //   //password hashing
  //   const saltRounds = 10;
  //   const hashedPassword = await bcrypt.hash(
  //     createStaffDto.password,
  //     saltRounds,
  //   );

  //   const staff = this.staffRepository.create({
  //     ...createStaffDto,
  //     image: filePath,
  //     password: hashedPassword,
  //   });

  //   return await this.staffRepository.save(staff);
  // }

  async create(
    createStaffDto: CreateStaffDto,
    file: Express.Multer.File,
  ): Promise<Staff> {
    if (!file) throw new Error('No file uploaded');

    const imageUrl = await this.imgFileService.uploadFile(file, 'staff');

    const hashedPassword = await bcrypt.hash(createStaffDto.password, 10);

    return await this.opService.create<Staff>(this.staffRepository, {
      ...createStaffDto,
      image: imageUrl,
      password: hashedPassword,
    });
  }

  async findAll(
    limit: number = 10,
    page: number = 1,
    lastId?: string,
    lastCreatedAt?: string,
    search?: string,
  ) {
    const queryBuilder = this.staffRepository.createQueryBuilder('staff');
    queryBuilder
      .leftJoinAndSelect('staff.role', 'role')
      .leftJoinAndSelect('staff.branch', 'branch');

    if (search) {
      queryBuilder.andWhere(
        '(staff.staff_name ILike :search OR staff.address ILike :search OR role.role_name ILike :search OR branch.branch_name ILike :search)',
        { search: `%${search}%` },
      );
    }

    if (lastId && lastCreatedAt && lastId !== 'undefined' && lastId !== '') {
      queryBuilder.andWhere(
        '(staff.created_at < :lastCreatedAt OR (staff.created_at = :lastCreatedAt AND branch.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip);
    }

    const data = await queryBuilder
      .orderBy('staff.created_at', 'DESC')
      .addOrderBy('staff.id', 'DESC')
      .take(limit)
      .getMany();

    let total: number;
    if (search) {
      total = await queryBuilder.getCount();
    } else {
      total = await this.staffRepository.count();
      if (total > 100) {
        const result = await this.staffRepository.query<{ estimate: string }[]>(
          `SELECT reltuples::bigint AS estimate 
          FROM pg_class c 
          JOIN pg_namespace n ON n.oid = c.relnamespace 
          WHERE n.nspname = 'master_company' 
          AND c.relname = 'staffs'`,
        );
        total = result && result.length > 0 ? Number(result[0].estimate) : 0;
      }
    }

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Update
  async update(
    id: string,
    updateStaffDto: UpdateStaffDto,
    file?: Express.Multer.File,
  ): Promise<Staff> {
    if (!updateStaffDto) {
      throw new Error('Update data (body) is missing');
    }
    if (file) {
      const existingStaff = await this.findOne(id);
      if (existingStaff.image) {
        await this.imgFileService.deleteFile(existingStaff.image);
      }

      const newImageUrl = await this.imgFileService.uploadFile(file, 'staff');
      updateStaffDto.image = newImageUrl;
    }

    if (updateStaffDto.password) {
      updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, 10);
    }

    return await this.opService.update<Staff>(
      this.staffRepository,
      id,
      updateStaffDto,
    );
  }
  // Delete
  async remove(id: string): Promise<Staff> {
    return await this.opService.remove<Staff>(this.staffRepository, id);
  }

  //Basic CRUD Code
}
