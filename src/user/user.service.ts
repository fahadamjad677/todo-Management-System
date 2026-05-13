import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { userSelect } from 'src/prisma/selects';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    //first Checking User Exists
    const exists = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('User Already Exists');
    }

    //Check department exists
    const deptExist = await this.prisma.department.findUnique({
      where: {
        id: createUserDto.departmentId,
      },
    });
    if (!deptExist) {
      throw new NotFoundException('dept not found');
    }

    //Check Role Exists
    const roleExists = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
      select: { id: true },
    });

    if (!roleExists) {
      throw new NotFoundException('Role not found');
    }

    //Creating User
    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
        roleId: createUserDto.roleId,
      },
      select: userSelect,
    });

    await this.prisma.userDepartment.create({
      data: {
        userId: user.id,
        departmentId: createUserDto.departmentId,
      },
    });

    return {
      success: true,
      msg: 'User Created successfully',
      data: user,
    };
  }

  //Get All Users
  async findAll() {
    const users = await this.prisma.user.findMany({
      select: userSelect,
    });

    return {
      success: true,
      msg: 'Users Fetched successfully',
      data: users,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      msg: 'User found Successfully',
      data: user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    //Check User Exist
    const exist = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exist) {
      throw new NotFoundException('User not found');
    }

    //Now check the  department id exists
    if (updateUserDto.departmentId) {
      const existsDepart = await this.prisma.department.findUnique({
        where: { id: updateUserDto.departmentId },
        select: { id: true },
      });

      if (!existsDepart) {
        throw new NotFoundException('department not found');
      }
    }

    //Now check the Role Id exists
    if (updateUserDto.roleId) {
      const existsRole = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
        select: { id: true },
      });

      if (!existsRole) {
        throw new NotFoundException('Role not found');
      }
    }

    //Finally Updating the User
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: userSelect,
    });

    return {
      success: true,
      msg: 'User updated Successfully',
      data: updatedUser,
    };
  }

  async remove(id: string) {
    const exists = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
      select: { id: true },
    });

    return {
      success: true,
      msg: 'User deleted Successfully',
    };
  }
}
