import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PayloadUser } from 'src/auth/types';
import { userSelect } from 'src/prisma/selects';

type userType = {
  id: string;
  name: string;
};

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  //Get All Reported To Users Tasks
  async getReportedTo(user: PayloadUser) {
    let users: userType[] | userType | null;

    if (user.role == 'ADMIN') {
      users = await this.prisma.user.findMany({
        select: { id: true, name: true },
      });
    } else if (user.role == 'MANAGER') {
      users = await this.prisma.user.findUnique({
        where: { id: user.sub },
        select: { id: true, name: true },
      });
      if (!users) {
        throw new NotFoundException('user not found');
      }
    } else {
      users = null;
    }

    return {
      success: true,
      msg: 'Assign Users returned successfully',
      data: users,
    };
  }

  //Get assigned To User Tasks
  async getAssignedTo(user: PayloadUser) {
    let users = {};
    if (user.role == 'ADMIN') {
      users = await this.prisma.user.findMany({
        select: { id: true, name: true },
      });
    } else if (user.role == 'MANAGER') {
      users = await this.prisma.user.findMany({
        where: {
          role: {
            name: 'user',
          },
          departments: {
            some: {
              department: {
                name: user.department,
              },
            },
          },
        },

        select: userSelect,
      });
    }

    return {
      success: true,
      msg: 'Assign Users returned successfully',
      data: users,
    };
  }
  async create(createTaskDto: CreateTaskDto, user: PayloadUser) {
    // const reportToUser = await this.prisma.user.findUnique({
    //   where: { id: createTaskDto.reportedToId },
    //   select: {
    //     id: true,
    //     departments: {
    //       select: {
    //         department: {
    //           select: {
    //             name: true,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    // if (!reportToUser) {
    //   throw new NotFoundException('user not found ');
    // }

    const assignedToUser = await this.prisma.user.findUnique({
      where: { id: createTaskDto.assignedToId },
      select: {
        id: true,
        departments: {
          select: {
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!assignedToUser) {
      throw new NotFoundException('User not found');
    }

    // if (reportToUser.departments != assignedToUser) {
    // }
    const task = await this.prisma.task.create({
      data: {
        name: createTaskDto.name,
        Description: createTaskDto.description,
        time: createTaskDto.time,
        assignedToId: createTaskDto.assignedToId,
        reportedToId: createTaskDto.reportedToId,
      },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }

  //-------------------HELPERS-----------------------
  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true },
    });

    return users;
  }
}
