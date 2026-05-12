import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DepartmentModule } from './department/department.module';
@Module({
  imports: [
    AuthModule,
    UserModule,
    RoleModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DepartmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
