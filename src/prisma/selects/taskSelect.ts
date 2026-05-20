import { Prisma } from 'generated/prisma/client';

export const taskSelect = {
  name: true,
  priority: true,
  Description: true,
  time: true,
  status: true,
  reportedTo: {
    select: {
      name: true,
    },
  },
  assignedTo: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.TaskSelect;
