import {
  IsEnum,
  IsString,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsUUID,
} from 'class-validator';

import { Priority, Status } from 'generated/prisma/enums';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsEnum(Priority, {
    message: 'Priority must be one of: LOW, MEDIUM, HIGH',
  })
  priority?: Priority;

  @IsOptional()
  @IsEnum(Status, {
    message: 'Status must be one of: TODO, IN_PROGRESS, DONE',
  })
  status?: Status;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @IsDateString({}, { message: 'Time must be a valid ISO date string' })
  time!: string;

  @IsUUID('4', { message: 'reportedToId must be a valid UUID' })
  @IsNotEmpty()
  reportedToId!: string;

  @IsUUID('4', { message: 'assignedToId must be a valid UUID' })
  @IsNotEmpty()
  assignedToId!: string;
}
