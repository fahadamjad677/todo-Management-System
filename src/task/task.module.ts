import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { CreateTaskPolicy, UpdateTaskPolicy, CommonTaskPolicy } from './policy';

@Module({
  controllers: [TaskController],
  providers: [
    TaskService,
    CreateTaskPolicy,
    UpdateTaskPolicy,
    CommonTaskPolicy,
  ],
})
export class TaskModule {}
