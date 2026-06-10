import { Injectable } from '@nestjs/common';
import { CommonService } from 'src/common/services/common.service';
import { assignToUser, reportedUser } from '../types';

@Injectable()
export class CommonTaskPolicy {
  constructor(private readonly commonService: CommonService) {}

  isSameDepartment(
    reportToUser: reportedUser,
    assignToUser: assignToUser,
  ): boolean {
    const reportedDepts = this.commonService.flattenDepartments(
      reportToUser,
      'name',
    );

    const assignedDepts = this.commonService.flattenDepartments(
      assignToUser,
      'name',
    );

    return reportedDepts.some((dept) => assignedDepts.includes(dept));
  }

  isManagerSelf(reportToUser: reportedUser, assignToUser: assignToUser) {
    return reportToUser.id === assignToUser.id;
  }
}
