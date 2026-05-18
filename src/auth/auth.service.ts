import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PayloadUser } from './types';
import { authUserSelect } from '../prisma/selects';
import { CommonService } from 'src/common/services/common.service';

@Injectable()
export class AuthService {
  constructor(
    private prismaservice: PrismaService,
    private jwtservice: JwtService,
    private configservice: ConfigService,
    private readonly commonservice: CommonService,
  ) {}

  //Sign
  async signin(dto: LoginDto) {
    const user = await this.prismaservice.user.findFirst({
      where: {
        email: dto.email,
      },
      select: authUserSelect,
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials (email)');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid credentials (password)');
    }

    const departments: string[] = this.commonservice.flattenDepartments(
      user,
      'id',
    );

    if (!departments.includes(dto.departmentId)) {
      throw new NotFoundException(' department not found');
    }

    return this.signToken(
      user.id,
      user.email,
      user.role.name,
      dto.departmentId,
    );
  }

  //Logut
  async logout(payload: PayloadUser) {
    //deleting refresh Token from database.
    await this.prismaservice.user.update({
      where: {
        id: payload.sub,
      },
      data: {
        refreshToken: null,
      },
    });

    return 'logut Successfull';
  }
  //---------Token Encrpytion------------------
  async signToken(
    id: string,
    email: string,
    role: string,
    departmentid: string,
  ) {
    const secretAcess = this.configservice.get<string>('JWT_ACCESS_SECRET');
    const secretRefresh = this.configservice.get<string>('JWT_REFRESH_SECRET');

    if (!secretAcess || !secretRefresh) {
      throw new Error('Jwt access or refresh secret not defined');
    }
    const payload = {
      sub: id,
      email: email,
      role: role,
      departmentId: departmentid,
    };

    //Acess Token Signed
    const access_token = await this.jwtservice.signAsync(payload, {
      expiresIn: '15m',
      secret: secretAcess,
    });

    //Refresh Token Signed
    const refresh_token = await this.jwtservice.signAsync(payload, {
      expiresIn: '60m',
      secret: secretRefresh,
    });

    //Hashing the Refresh and storing in database.
    const hashedRefresh = await bcrypt.hash(refresh_token, 10);

    await this.prismaservice.user.update({
      where: { id: id },
      data: { refreshToken: hashedRefresh },
    });

    return { access_token, refresh_token };
  }

  //Refresh  rotation
  async refresh(user: PayloadUser) {
    //Finding User.
    const payload = await this.prismaservice.user.findUnique({
      where: {
        email: user.email,
      },
      select: authUserSelect,
    });

    if (!payload) {
      throw new BadRequestException(' Invalid Cridentails');
    }

    return this.signToken(
      payload.id,
      payload.email,
      payload.role.name,
      user.department,
    );
  }
}
