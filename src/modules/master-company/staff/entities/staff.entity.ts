//src/modules/master-company/staff/entities/staff.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from '../../../master-service/role/entities/role.entity';
import { Branch } from '../../branch/entities/branch.entity';

@Entity({ schema: 'master_company', name: 'staffs' })
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  staff_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  address: string;

  @Column()
  role_id: string;

  @ManyToOne(() => Role, (role) => role.staffs)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column()
  branch_id: string;

  @ManyToOne(() => Branch, (branch) => branch.staffs)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column()
  phone: string;

  @Column()
  position: string;

  @Column()
  image: string;

  @Column({ select: false })
  password: string;

  @Index()
  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
