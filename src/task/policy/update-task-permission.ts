import { UpdateTaskDto } from '../dto';
import { Role } from '../types';

type updatTaskFields = keyof UpdateTaskDto;
export const ROLE_FIELD_PERMISSIONS: Record<
  Role,
  readonly updatTaskFields[] | '*'
> = {
  USER: ['name', 'description', 'status'],

  MANAGER: [
    'name',
    'description',
    'status',
    'priority',
    'time',
    'reportedToId',
    'assignedToId',
  ],

  ADMIN: '*',
} as const;
