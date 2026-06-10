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
      id: true,
    },
  },
  assignedTo: {
    select: {
      name: true,
      id: true,
    },
  },
  createdById: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.TaskSelect;
