import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PayloadUser } from 'src/auth/types';
import { assignToUser, reportedUser, Role } from '../types';
import { UpdateTaskDto } from '../dto';
import {
  CreateTaskPolicy,
  ROLE_FIELD_PERMISSIONS,
  ROLE_STATUS_PERMISSIONS,
} from '.';
import { Status } from 'generated/prisma/enums';

@Injectable()
export class UpdateTaskPolicy {
  constructor(private createtaskpolicy: CreateTaskPolicy) {}
  validate(
    user: PayloadUser,
    dto: UpdateTaskDto,
    reportToUser: reportedUser,
    assignToUser: assignToUser,
    finalStatus: Status,
    assignedScore: number,
  ) {
    // Basic field validation
    this.handleBasicFields(user, dto);

    // Status transitions
    this.handleStatus(user, dto);

    //Handle Score Assignment
    this.handleScoreAssignment(user, dto, finalStatus, assignedScore);

    //  Assignment logic
    this.handleAssignment(user, reportToUser, assignToUser);
  }

  //Basic Fields Handler
  private handleBasicFields(user: PayloadUser, dto: UpdateTaskDto) {
    const userRole: Role = user.role as Role;
    const allowed = ROLE_FIELD_PERMISSIONS[userRole];
    const incomingFields = Object.keys(dto) as (keyof UpdateTaskDto)[];

    // Admin can update everything
    if (allowed === '*') return;

    const invalidFields = incomingFields.filter(
      (field) => !allowed.includes(field),
    );

    if (invalidFields.length > 0) {
      throw new ForbiddenException(
        `You are not allowed to update: ${invalidFields.join(', ')}`,
      );
    }
  }

  //Status Transition Handler
  private handleStatus(user: PayloadUser, dto: UpdateTaskDto) {
    if (!dto.status) return;

    const UserRole: Role = user.role as Role;
    const allowed = ROLE_STATUS_PERMISSIONS[UserRole];

    // Admin can do anything
    if (allowed === '*') return;

    if (!allowed.includes(dto.status)) {
      throw new ForbiddenException(
        `Role ${user.role} cannot set status to ${dto.status}`,
      );
    }
  }

  //ReportTo, AssignTo Business Validation Handler
  private handleAssignment(
    user: PayloadUser,
    reportToUser: reportedUser,
    assignToUser: assignToUser,
  ) {
    //Policy Check whether the admin, manager or user can create a task
    if (!this.createtaskpolicy.validate(user, reportToUser, assignToUser)) {
      throw new ForbiddenException('USER CANNOT UPDATE A TASK');
    }
  }

  private handleScoreAssignment(
    user: PayloadUser,
    dto: UpdateTaskDto,
    finalStatus: Status,
    assignedScore: number,
  ) {
    const isAssigningAssignedScore = dto.assignedScore !== undefined;
    const isAssigningObtainedScore = dto.obtainedScore !== undefined;

    if (
      user.role === 'USER' &&
      (isAssigningAssignedScore || isAssigningObtainedScore)
    ) {
      throw new ForbiddenException('Users cannot modify scores');
    }

    if (isAssigningAssignedScore) {
      if (dto.assignedScore && dto.assignedScore <= 0) {
        throw new BadRequestException('Assigned score must be greater than 0');
      }
    }

    if (isAssigningObtainedScore) {
      if (user.role !== 'ADMIN') {
        throw new ForbiddenException('Only admin can assign obtained score');
      }

      if (finalStatus !== 'COMPLETED') {
        throw new BadRequestException('Task must be completed first');
      }

      if (dto.obtainedScore && dto.obtainedScore > assignedScore) {
        throw new BadRequestException('Invalid score');
      }
    }
  }
}
