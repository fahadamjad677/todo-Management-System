import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PayloadUser } from '../types';
import { authUserSelect } from '../../prisma/selects';
import { CommonService } from 'src/common/services/common.service';

@Injectable()
export class AcessjwtStrategy extends PassportStrategy(
  Strategy,
  'accessStrategy',
) {
  constructor(
    configservice: ConfigService,
    private prismaservice: PrismaService,
    private readonly commonservice: CommonService,
  ) {
    const secret = configservice.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('Jwt access Secret not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }
  async validate(payload: PayloadUser) {
    if (!payload) {
      throw new UnauthorizedException('Invalid Token');
    }
    const user = await this.prismaservice.user.findFirst({
      where: { email: payload.email },
      select: authUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Token');
    }
    //payload
    const payloaduser: PayloadUser = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      department: payload.department,
    };
    return payloaduser;
  }
}
