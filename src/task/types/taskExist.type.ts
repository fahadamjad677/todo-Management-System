import { Status } from 'generated/prisma/enums';

export type taskExist = {
  id: string;
  reportedToId: string;
  assignedToId: string;
  createdbyId: string;
  status: Status;
};
