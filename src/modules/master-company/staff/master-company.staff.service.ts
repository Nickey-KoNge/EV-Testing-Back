// src/modules/master-company/staff/master-company.staff.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dtos/create.staff.dto';
import { UpdateStaffDto } from './dtos/update.staff.dto';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MasterCompanyStaffService {
  private s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly configService: ConfigService,
  ) {
    // We use bracket notation to bypass the linter's 'unsafe-call' if it can't resolve the type
    const config = this.configService;

    this.bucketName = config['get']<string>('AWS_S3_BUCKET_NAME') || '';

    this.s3Client = new S3Client({
      region: config['get']<string>('AWS_S3_REGION') || '',
      credentials: {
        accessKeyId: config['get']<string>('AWS_S3_ACCESS_KEY') || '',
        secretAccessKey: config['get']<string>('AWS_S3_SECRET_KEY') || '',
      },
    });
  }
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

  // Create
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

    // Safe property access for Multer
    const originalName = file['originalname'];
    const fileBuffer = file['buffer'];
    const mimetype = file['mimetype'];

    const fileName = `staff/${uuidv4()}${path.extname(originalName)}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype,
      }),
    );

    const config = this.configService;
    const region = config['get']<string>('AWS_S3_REGION') as string;
    const imageUrl = `https://${this.bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createStaffDto.password,
      saltRounds,
    );

    const staff = this.staffRepository.create({
      ...createStaffDto,
      image: imageUrl,
      password: hashedPassword,
    });

    return await this.staffRepository.save(staff);
  }

  async findAll(
    limit: number = 10,
    page?: number,
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

    if (lastId && lastCreatedAt) {
      queryBuilder.andWhere(
        '(staff.created_at < :lastCreatedAt OR (staff.created_at = :lastCreatedAt AND branch.id < :lastId))',
        { lastCreatedAt, lastId },
      );
    } else if (page && page > 1) {
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
      const result = await this.staffRepository.query<{ estimate: string }[]>(
        `SELECT reltuples::bigint AS estimate 
          FROM pg_class c 
          JOIN pg_namespace n ON n.oid = c.relnamespace 
          WHERE n.nspname = 'master_company' 
          AND c.relname = 'staffs'`,
      );
      total = result && result.length > 0 ? Number(result[0].estimate) : 0;
    }
    console.log('staff data:', data);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Update
  async update(id: string, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);

    if (updateStaffDto.password) {
      updateStaffDto.password = await bcrypt.hash(updateStaffDto.password, 10);
    }
    Object.assign(staff, updateStaffDto);
    return await this.staffRepository.save(staff);
  }
  async remove(id: string): Promise<void> {
    const staff = await this.findOne(id);

    if (staff.image) {
      // Extract the 'Key' (fileName) from the full URL
      // Example URL: https://bucket.s3.region.amazonaws.com/staff/uuid.jpg
      // We need just: staff/uuid.jpg
      const fileKey = staff.image.split(
        `${this.bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`,
      )[1];

      if (fileKey) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
          }),
        );
      }
    }

    await this.staffRepository.remove(staff);
  }
  // Delete
  // async remove(id: string): Promise<void> {
  //   const staff = await this.findOne(id);
  //   if (staff.image && fs.existsSync(staff.image)) {
  //     fs.unlinkSync(staff.image);
  //   }
  //   await this.staffRepository.remove(staff);
  // }
  //Basic CRUD Code
}
