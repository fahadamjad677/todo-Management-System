import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskPolicy } from './policy';
import { TaskValidator } from './validator/task.validator';

@Module({
  controllers: [TaskController],
  providers: [TaskService, TaskPolicy, TaskValidator],
})
export class TaskModule {}
