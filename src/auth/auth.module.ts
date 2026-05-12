import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AcessjwtStrategy, RefreshjwtStrategy } from './strategy';
@Module({
  controllers: [AuthController],
  providers: [AuthService, AcessjwtStrategy, RefreshjwtStrategy],
  imports: [JwtModule.register({})],
})
export class AuthModule {}
