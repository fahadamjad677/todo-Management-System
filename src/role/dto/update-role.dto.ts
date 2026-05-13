import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './index';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
