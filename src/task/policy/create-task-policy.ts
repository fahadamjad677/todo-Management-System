import { Injectable } from '@nestjs/common';
import { PayloadUser } from 'src/auth/types';
import { assignToUser, reportedUser } from '../types';
import { CommonTaskPolicy } from '../policy';

@Injectable()
export class CreateTaskPolicy {
  constructor(private readonly commonPolicy: CommonTaskPolicy) {}

  validate(
    user: PayloadUser,
    reportToUser: reportedUser,
    assignToUser: assignToUser,
  ): boolean {
    // USER cannot create
    if (user.role === 'USER') return false;

    if (user.role === 'ADMIN') {
      return this.handleAdmin(reportToUser, assignToUser);
    }

    if (user.role === 'MANAGER') {
      return this.handleManager(user, reportToUser, assignToUser);
    }

    return false;
  }

  // ADMIN RULES
  private handleAdmin(
    reportToUser: reportedUser,
    assignToUser: assignToUser,
  ): boolean {
    const reportRole = reportToUser.role.name;
    const assignRole = assignToUser.role.name;

    if (reportRole === 'USER') return false;

    // admin reportTo himself then assignto any other will generate error
    if (reportRole === 'ADMIN' && assignRole !== 'ADMIN') {
      return false;
    }

    // reportTo manager then assignto admin error
    if (reportRole === 'MANAGER' && assignRole === 'ADMIN') {
      return false;
    }

    // reportRole manager then AssignRole can be the same Manager
    if (assignRole === 'MANAGER') {
      return this.commonPolicy.isManagerSelf(reportToUser, assignToUser);
    }

    // reportRole manager then AssingRole can be user under the manager
    if (assignRole === 'USER') {
      return this.commonPolicy.isSameDepartment(reportToUser, assignToUser);
    }
    return false;
  }

  // MANAGER RULES
  private handleManager(
    user: PayloadUser,
    reportToUser: reportedUser,
    assignToUser: assignToUser,
  ): boolean {
    const reportRole = reportToUser.role.name;
    const assignRole = assignToUser.role.name;

    // cannot report to admin or user
    if (reportRole === 'ADMIN' || reportRole === 'USER') return false;

    // must report to self
    if (reportToUser.id !== user.sub) return false;

    // assign to self
    if (assignRole === 'MANAGER') {
      return assignToUser.id === user.sub;
    }

    // assign to user under manager
    if (assignRole === 'USER') {
      return this.commonPolicy.isSameDepartment(reportToUser, assignToUser);
    }

    return false;
  }
}
