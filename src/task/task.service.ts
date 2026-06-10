import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto, GetTasksQueryDto, UpdateTaskDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PayloadUser } from 'src/auth/types';
import { CommonService } from 'src/common/services/common.service';
import { taskSelect } from 'src/prisma/selects';
import { reportedUser } from './types';
import { Prisma } from 'generated/prisma/client';
import { CreateTaskPolicy, UpdateTaskPolicy } from './policy';

type userType = {
  id: string;
  name: string;
};

type TaskUserType = 'REPORT_TO' | 'ASSIGN_TO';

@Injectable()
export class TaskService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonservice: CommonService,
    private readonly createtaskpolicy: CreateTaskPolicy,
    private readonly updatetaskpolicy: UpdateTaskPolicy,
  ) {}

  //Get All Reported To Users Tasks
  async getReportedTo(user: PayloadUser) {
    let users: userType[] | userType | null = null;

    //if Role is admin then return Admin and other Users with role Manager
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
    }
    // if role is manager then return manager itself
    else if (user.role == 'MANAGER') {
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
  async getAssignedTo(user: PayloadUser, reportedToId: string) {
    let users: userType[] | userType | null;

    //can Assign to itself or other manager
    if (user.role == 'ADMIN') {
      const reportedUser: reportedUser | null = await this.getTaskUserById(
        reportedToId,
        'REPORT_TO',
      );
      if (!reportedUser) {
        throw new NotFoundException('ReportedTo user not found');
      }

      //Admin Reports Task to Himself then return the Admin Assignee
      if (reportedUser.role.name == user.role) {
        users = {
          id: reportedUser.id,
          name: reportedUser.name,
        };
      }
      //Admin Reports tasks to manager then Returns Users under That Manager
      else if (reportedUser.role.name == 'MANAGER') {
        const reportedUserDeptNames = this.commonservice.flattenDepartments(
          reportedUser,
          'name',
        );
        users = await this.prisma.user.findMany({
          where: {
            role: {
              name: 'USER',
            },
            departments: {
              some: {
                department: {
                  name: { in: reportedUserDeptNames },
                },
              },
            },
          },
          select: { id: true, name: true },
        });
      } else {
        users = null;
      }
    }
    // Manager Assigns to Users under him
    else if (user.role == 'MANAGER') {
      users = await this.prisma.user.findMany({
        where: {
          role: {
            name: 'USER',
          },
          departments: {
            some: {
              department: {
                id: user.department,
              },
            },
          },
        },

        select: { name: true, id: true },
      });
    } else {
      users = null;
    }

    return {
      success: true,
      msg: 'Assign Users returned successfully',
      data: users,
    };
  }

  //Create Task
  async create(createTaskDto: CreateTaskDto, user: PayloadUser) {
    //Getting ReportToUser, AssignToUser
    const reportToUser = await this.getTaskUserById(
      createTaskDto.reportedToId,
      'REPORT_TO',
    );

    const assignToUser = await this.getTaskUserById(
      createTaskDto.assignedToId,
      'ASSIGN_TO',
    );

    //Policy Check whether the admin, manager or user can create a task
    if (!this.createtaskpolicy.validate(user, reportToUser, assignToUser)) {
      throw new ForbiddenException('USER CANNOT CREATE A TASK');
    }

    //Create A task
    const task = await this.prisma.task.create({
      data: {
        name: createTaskDto.name,
        Description: createTaskDto.description,
        time: createTaskDto.time,
        assignedToId: createTaskDto.assignedToId,
        reportedToId: createTaskDto.reportedToId,
        createdbyId: user.sub,
      },
    });

    return {
      success: true,
      msg: 'Reported Users returned successfully',
      data: task,
    };
  }

  //Get Tasks
  async getTasks(user: PayloadUser, query: GetTasksQueryDto) {
    const { status, priority, offset = 0, limit = 10 } = query;

    // dynamic Where Object
    let where: Prisma.TaskWhereInput = {};

    if (user.role === 'ADMIN') {
      // Admin sees everything
    } else if (user.role === 'MANAGER') {
      where = {
        OR: [{ reportedToId: user.sub }, { assignedToId: user.sub }],
      };
    } else {
      where = {
        assignedToId: user.sub,
      };
    }

    // Merge filters instead of overwriting
    if (status) {
      where = {
        ...where,
        status,
      };
    }

    if (priority) {
      where = {
        ...where,
        priority,
      };
    }

    // Transaction for consistency
    const [tasks, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: taskSelect,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      success: true,
      msg: 'Tasks Returned Successfully',
      data: tasks,
      meta: {
        total,
        offset,
        limit,
        hasMore: offset + limit < total,
      },
    };
  }

  //Update Task
  async update(id: string, updateTaskDto: UpdateTaskDto, user: PayloadUser) {
    //Check Id exists
    const checkTaskExist = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        reportedToId: true,
        assignedToId: true,
        createdbyId: true,
        status: true,
      },
    });

    if (!checkTaskExist) {
      throw new NotFoundException('TASK not found');
    }

    //2. ONLY Getting The final ReportTo and AssignTo from db in a single Fetch
    const finalReportToId =
      updateTaskDto.reportedToId ?? checkTaskExist.reportedToId;

    const finalAssignToId =
      updateTaskDto.assignedToId ?? checkTaskExist.assignedToId;

    const [finalReportToUser, finalAssignToUser] = await Promise.all([
      this.getTaskUserById(finalReportToId, 'REPORT_TO'),
      this.getTaskUserById(finalAssignToId, 'ASSIGN_TO'),
    ]);

    //3. Validating The Policies of Updating the task
    this.updatetaskpolicy.validate(
      user,
      updateTaskDto,
      finalReportToUser,
      finalAssignToUser,
    );

    //FINAL Update
    const updatedTask = await this.prisma.task.update({
      where: { id: id },
      data: updateTaskDto,
      select: taskSelect,
    });

    return {
      success: true,
      msg: 'Task Updated Successfuly',
      data: updatedTask,
    };
  }
  //-------------------HELPERS-----------------------

  // Get User By Id for Task Service like reportTo, AssignTo
  private async getTaskUserById(userId: string, type: TaskUserType) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: { select: { name: true } },
        departments: {
          select: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      const errorMessage =
        type === 'REPORT_TO'
          ? 'ReportedTo user not found'
          : 'AssignedTo user not found';

      throw new NotFoundException(errorMessage);
    }

    return user;
  }
}
