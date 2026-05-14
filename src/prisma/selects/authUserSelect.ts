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
} satisfies Prisma.UserSelect;
