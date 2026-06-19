import { ForbiddenException } from '@nestjs/common';
import { PayloadUser } from 'src/auth/types';

export function checkCreateCommentPolicy(
  user: PayloadUser,
  taskReportToId: string,
  taskAssignToId: string,
) {
  if (user.role === 'ADMIN') return;

  if (user.role === 'MANAGER') {
    if (taskReportToId === user.sub || taskAssignToId === user.sub) {
      return;
    }
  }

  if (user.role === 'USER') {
    if (taskAssignToId === user.sub) {
      return;
    }
  }

  throw new ForbiddenException('You are not allowed to comment on this task');
}
