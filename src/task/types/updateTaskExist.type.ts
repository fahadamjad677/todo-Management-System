import { Status } from 'generated/prisma/enums';

export type updateTaskExist = {
  id: string;
  reportedToId: string;
  assignedToId: string;
  createdbyId: string;
  status: Status;
};
