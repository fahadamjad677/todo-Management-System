import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [AuthModule, UserModule, RoleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
