import { IsOptional, IsEnum } from 'class-validator';
import { Priority, Status } from 'generated/prisma/enums';

export class GetTasksQueryDto {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
