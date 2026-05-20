import { Prisma } from 'generated/prisma/client';
import { taskSelect } from '../../prisma/selects/taskSelect';

export type TaskType = Prisma.TaskGetPayload<{
  select: typeof taskSelect;
}>;
