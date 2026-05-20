import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Priority, Status } from 'generated/prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  time?: Date;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsUUID()
  reportedToId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}
