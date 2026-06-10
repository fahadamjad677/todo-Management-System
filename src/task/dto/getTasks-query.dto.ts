import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsInt, Max, Min } from 'class-validator';
import { Priority, Status } from 'generated/prisma/enums';

export class GetTasksQueryDto {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  // Pagination
  @IsOptional()
  @Type(() => Number) // String to Number
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
