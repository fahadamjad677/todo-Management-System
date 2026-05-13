import { Prisma } from 'generated/prisma/client';

export const userSelect = {
  id: true,
  email: true,
  role: {
    select: {
      name: true,
    },
  },
  departments: {
    select: {
      department: {
        select: {
          name: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;
