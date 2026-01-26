// src/database/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// import { ConfigModule } from '@nestjs/config';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'nickey',
  password: '166495',
  database: 'myanmar_brilliance_auto_db',
  autoLoadEntities: true,
  synchronize: false, // Schema တွေ လက်နဲ့ဆောက်ထားလို့ ဒါကို အမြဲ false ထားပါ
  logging: true, // Debug လုပ်ရလွယ်အောင် query တွေကို console မှာပြခိုင်းထားပါ
};
