import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PayloadUser } from 'src/auth/types';
import { userSelect } from 'src/prisma/selects';
import { CommonService } from 'src/common/services/common.service';

type userType = {
  id: string;
  name: string;
};

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonservice: CommonService,
  ) {}

  //Get All Reported To Users Tasks
  async getReportedTo(user: PayloadUser) {
    let users: userType[] | userType | null;

    if (user.role == 'ADMIN') {
      users = await this.prisma.user.findMany({
        where: {
          role: {
            name: {
              in: ['ADMIN', 'MANAGER'],
            },
          },
        },
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
      msg: 'Reported Users returned successfully',
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
    const { reportToUser, assignToUser } =
      await this.getReportedandAssignedUserById(createTaskDto);

    //Admin Criteria
    if (user.role == 'ADMIN') {
      //ReportTo==Assignto
      if (
        reportToUser.role.name == 'ADMIN' &&
        assignToUser.role.name != 'ADMIN'
      ) {
        throw new ConflictException('ReportToUser mismatch with AssignToUser');
      }

      //ReportTo=Manager so AssignTo belongs to that managers' department
      if (
        reportToUser.role.name == 'MANAGER' &&
        assignToUser.role.name == 'USER'
      ) {
        const reportedDepts = this.commonservice.flattenDepartments(
          reportToUser,
          'name',
        );

        const assigneDepts = this.commonservice.flattenDepartments(
          assignToUser,
          'name',
        );

        console.log('ReportedDepts', reportedDepts);
        console.log('AssignedDepts', assigneDepts);
        const CheckDeptMatch = reportedDepts.some((dept) => {
          return assigneDepts.includes(dept);
        });

        console.log('CheckDepthMatch', CheckDeptMatch);
        if (!CheckDeptMatch) {
          throw new ConflictException(
            'reportedTo dept not matches with assignedTo dept',
          );
        }
      }
    }

    const task = await this.prisma.task.create({
      data: {
        name: createTaskDto.name,
        Description: createTaskDto.description,
        time: createTaskDto.time,
        assignedToId: createTaskDto.assignedToId,
        reportedToId: createTaskDto.reportedToId,
      },
    });

    return {
      success: true,
      msg: 'Reported Users returned successfully',
      data: task,
    };
  }

  //Get Reported To and AssignedTo user by Id
  async getReportedandAssignedUserById(createTaskDto: CreateTaskDto) {
    const reportToUser = await this.prisma.user.findUnique({
      where: { id: createTaskDto.reportedToId },
      select: {
        id: true,
        role: { select: { name: true } },
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

    if (!reportToUser) {
      throw new NotFoundException('reportedTo Id not found ');
    }

    const assignToUser = await this.prisma.user.findUnique({
      where: { id: createTaskDto.assignedToId },
      select: {
        id: true,
        role: { select: { name: true } },
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

    if (!assignToUser) {
      throw new NotFoundException('Assigned To Id not  found');
    }

    return { reportToUser, assignToUser };
  }

  //-------------------HELPERS-----------------------
  async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true },
    });

    return users;
  }
}
