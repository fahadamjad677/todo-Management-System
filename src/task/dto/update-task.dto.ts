import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { Priority, Status } from 'generated/prisma/client';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Priority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH',
  })
  priority?: Priority;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  time?: Date;

  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be one of: TODO, IN_PROGRESS,REVIEW, COMPLETED',
  })
  status?: Status;

  @IsOptional()
  @IsUUID()
  reportedToId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsInt({ message: 'Assigned score must be an integer' })
  @Min(1, { message: 'Assigned score must be at least 1' })
  assignedScore!: number;

  @IsInt({ message: 'Assigned score must be an integer' })
  @Min(1, { message: 'Assigned score must be at least 1' })
  obtainedScore!: number;
}
