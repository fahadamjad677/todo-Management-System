import { Prisma } from 'generated/prisma/client';

export const authUserSelect = {
  id: true,
  email: true,
  password: true,
  role: {
    select: {
      name: true,
    },
  },
  departments: {
    select: {
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.UserSelect;
