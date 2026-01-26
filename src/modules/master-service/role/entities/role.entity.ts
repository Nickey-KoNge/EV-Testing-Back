// src/modules/master-service/role/entities/role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Staff } from 'src/modules/master-company/staff/entities/staff.entity';

@Entity({ schema: 'master_service', name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  role_name: string;

  @Index()
  @Column()
  status: string;

  @OneToMany(() => Staff, (staff) => staff.role)
  staffs: Staff[];

  @CreateDateColumn() // အလိုအလျောက် Created time ထည့်ပေးသည်
  created_at: Date;

  @UpdateDateColumn() // Update လုပ်တိုင်း အလိုအလျောက် အချိန်ပြောင်းပေးသည်
  updated_at: Date;
}
