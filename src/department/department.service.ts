import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';

//Here Later Admin Authorization decorator will authorize it.
@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  //Create Department
  async create(createDepartmentDto: CreateDepartmentDto) {
    const exists = await this.prisma.department.findUnique({
      where: { name: createDepartmentDto.name },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('department already exists');
    }

    const department = await this.prisma.department.create({
      data: {
        name: createDepartmentDto.name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      msg: 'Department Created Successfully',
      data: department,
    };
  }

  //Get All Departments
  async findAll() {
    const departments = await this.prisma.department.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      msg: 'Departments Returned Successfully',
      data: departments,
    };
  }

  //Get Single Department
  async findOne(id: string) {
    const user = await this.prisma.department.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return {
      success: true,
      msg: 'Department found successfully',
      data: user,
    };
  }

  //Update Department
  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const exists = await this.prisma.department.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

    if (!exists) {
      throw new NotFoundException('department not found');
    }

    const updatedUser = await this.prisma.department.update({
      where: { id },
      data: {
        name: updateDepartmentDto.name,
      },
    });

    return {
      success: true,
      msg: 'Department found successfully',
      data: updatedUser,
    };
  }

  //Delete Department
  async remove(id: string) {
    const exist = await this.prisma.department.findUnique({
      where: { id },
      select: { id: true },
    });

    if (exist) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.department.delete({
      where: { id },
      select: { id: true },
    });

    return {
      success: true,
      msg: 'Department Deleted Successfully',
    };
  }
}
