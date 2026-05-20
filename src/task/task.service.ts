import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PayloadUser } from 'src/auth/types';
import { CommonService } from 'src/common/services/common.service';
import { taskSelect } from 'src/prisma/selects';
import { assignToUser, reportedUser, TaskType } from './types';

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

    //if Role is user then return Admin and other Users with role Manager
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
      const reportedUser: reportedUser | null =
        await this.getUserById(reportedToId);
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
    const reportToUser = await this.getReportToUserByReportToId(
      createTaskDto.reportedToId,
    );

    const assignToUser = await this.getAssignToUserByAssignToId(
      createTaskDto.assignedToId,
    );
    //Admin Criteria
    if (user.role == 'ADMIN') {
      this.CheckAdminPermissions(reportToUser, assignToUser);
    } else if (user.role == 'MANAGER') {
      if (user.sub != reportToUser.id) {
        throw new ConflictException('MANAGER can only report to themself');
      } else if (assignToUser.role.name != 'USER') {
        throw new ConflictException('MANAGER can only assign users');
      }

      const assignedepts = this.commonservice.flattenDepartments(
        assignToUser,
        'id',
      );
      const checkAssigne = assignedepts.includes(user.department);
      if (!checkAssigne) {
        throw new ConflictException(
          'MANAGER can only assign user of their own departments',
        );
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

  //Get Tasks
  async getTasks(user: PayloadUser) {
    let tasks: TaskType[] | [];

    //Get All Tasks Under Admin
    if (user.role == 'ADMIN') {
      tasks = await this.prisma.task.findMany({
        select: taskSelect,
      });
    }
    //Get all Tasks Under Manager
    else if (user.role == 'MANAGER') {
      console.log('userId', user.sub);
      tasks = await this.prisma.task.findMany({
        where: {
          OR: [{ reportedToId: user.sub }, { assignedToId: user.sub }],
        },
        select: taskSelect,
      });
    }
    //Get All Tasks Under User
    else {
      tasks = await this.prisma.task.findMany({
        where: {
          assignedToId: user.sub,
        },
        select: taskSelect,
      });
    }

    return {
      success: true,
      msg: 'Tasks Returned Successfully',
      data: tasks,
    };
  }

  //Update Task
  async update(id: string, updateTaskDto: UpdateTaskDto, user: PayloadUser) {
    //Check Id exists
    const checkTaskExist = await this.prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        reportedTo: {
          select: {
            id: true,
          },
        },
        assignedToId: true,
      },
    });

    if (!checkTaskExist) {
      throw new NotFoundException('TASK not found');
    }

    //ADMIN VALIDATION
    if (user.role == 'ADMIN') {
      //Check ReportToValidation
      if (updateTaskDto.reportedToId) {
        //if reportTo updated and assignTo provided
        if (
          updateTaskDto.reportedToId != checkTaskExist.reportedTo.id &&
          updateTaskDto.assignedToId
        ) {
          const reportToUser = await this.getReportToUserByReportToId(
            updateTaskDto.reportedToId,
          );

          const assignToUser = await this.getAssignToUserByAssignToId(
            updateTaskDto.assignedToId,
          );

          this.CheckAdminPermissions(reportToUser, assignToUser);
        }
        // ReportTo Updated AssignedTo not Provided
        else if (
          updateTaskDto.reportedToId != checkTaskExist.reportedTo.id &&
          !updateTaskDto.assignedToId
        ) {
          throw new ConflictException('AssignTo Not provided');
        }

        // ReportTo Not provided Then Checking AssignTo
        else if (updateTaskDto.reportedToId == checkTaskExist.reportedTo.id) {
          if (
            updateTaskDto.assignedToId &&
            updateTaskDto.assignedToId != checkTaskExist.assignedToId
          ) {
            const reportToUser = await this.getReportToUserByReportToId(
              updateTaskDto.reportedToId,
            );

            const assignToUser = await this.getAssignToUserByAssignToId(
              updateTaskDto.assignedToId,
            );

            this.CheckAdminPermissions(reportToUser, assignToUser);
          }
        }
      }
      // ReportTo Not Provided
      else if (!updateTaskDto.reportedToId) {
        if (updateTaskDto.assignedToId) {
          throw new ConflictException('ReportTo Not Provided');
        }
      }
    }

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

  //check Admin Permissions
  CheckAdminPermissions(
    reportToUser: reportedUser,
    assignToUser: assignToUser,
  ) {
    //ReportTo==Assignto
    if (
      reportToUser.role.name == 'ADMIN' &&
      assignToUser.role.name != 'ADMIN'
    ) {
      throw new ConflictException('ReportToUser mismatch with AssignToUser');
    }

    //ReportTo=Manager so AssignTo belongs to that managers' department
    else if (
      reportToUser.role.name == 'MANAGER' &&
      assignToUser.role.name != 'USER'
    ) {
      throw new ConflictException('Invalid ReportTo, AssignTo Allocation');
    }
    // ReportTO if User then throw Error
    else if (reportToUser.role.name == 'USER') {
      throw new NotFoundException('invalid reportTo User');
    }
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
  //Get ReportToUser by ReportToId
  private async getReportToUserByReportToId(reportToId: string) {
    const reportToUser = await this.prisma.user.findUnique({
      where: { id: reportToId },
      select: {
        id: true,
        name: true,
        role: { select: { name: true } },
        departments: {
          select: {
            department: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!reportToUser) {
      throw new NotFoundException('reportedTo Id not found ');
    }
    return reportToUser;
  }

  //Get AssignToUser by AssignToId
  private async getAssignToUserByAssignToId(assignToId: string) {
    const assignToUser = await this.prisma.user.findUnique({
      where: { id: assignToId },
      select: {
        id: true,
        role: { select: { name: true } },
        departments: {
          select: {
            department: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    if (!assignToUser) {
      throw new NotFoundException('Assigned To Id not  found');
    }

    return assignToUser;
  }
  private async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        role: { select: { name: true } },
        departments: {
          select: {
            department: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        },
      },
    });

    return user;
  }

  //GetDepartment by Id
  private async getDepartmentNamebyId(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      select: { name: true },
    });

    return dept;
  }
  private async findAllUsers() {
    const users = await this.prisma.user.findMany({
      select: { id: true, name: true },
    });

    return users;
  }
}
