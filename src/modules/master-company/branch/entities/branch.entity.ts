// src/modules/master-company/branch/entities/branch.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Staff } from '../../staff/entities/staff.entity';

@Entity({ schema: 'master_company', name: 'branches' })
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  branch_name: string;

  @Column()
  address: string;

  @Index()
  @Column()
  status: string;

  @OneToMany(() => Staff, (staff) => staff.branch)
  staffs: Staff[];

  @CreateDateColumn() // အလိုအလျောက် Created time ထည့်ပေးသည်
  created_at: Date;

  @UpdateDateColumn() // Update လုပ်တိုင်း အလိုအလျောက် အချိန်ပြောင်းပေးသည်
  updated_at: Date;
}
