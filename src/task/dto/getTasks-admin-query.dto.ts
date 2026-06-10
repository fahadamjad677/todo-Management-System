import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsInt,
  Max,
  Min,
  IsBoolean,
} from 'class-validator';
import { Priority, Status } from 'generated/prisma/enums';

export class GetTasksAdminQueryDto {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  // NEW FILTERS
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  reportedTo?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  assignedTo?: boolean;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
