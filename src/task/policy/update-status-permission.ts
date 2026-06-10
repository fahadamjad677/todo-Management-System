import { Status } from 'generated/prisma/client';
import { Role } from '../types';

export const ROLE_STATUS_PERMISSIONS: Record<Role, Status[] | '*'> = {
  USER: ['TODO', 'IN_PROGRESS', 'REVIEW'],
  MANAGER: ['TODO', 'IN_PROGRESS', 'REVIEW'],
  ADMIN: '*',
};
