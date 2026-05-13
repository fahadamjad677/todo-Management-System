import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Role
  async create(createRoleDto: CreateRoleDto) {
    const exists = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('Role already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      msg: 'Role created successfully',
      data: role,
    };
  }

  // Get All Roles
  async findAll() {
    const roles = await this.prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      msg: 'Roles fetched successfully',
      data: roles,
    };
  }

  // Get Single Role
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      success: true,
      msg: 'Role fetched successfully',
      data: role,
    };
  }

  // Update Role
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const exists = await this.prisma.role.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Role not found');
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      msg: 'Role updated successfully',
      data: updatedRole,
    };
  }

  // Delete Role
  async remove(id: string) {
    const exists = await this.prisma.role.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return {
      success: true,
      msg: 'Role deleted successfully',
    };
  }
}
